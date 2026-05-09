import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { MercadoPagoConfig, Payment } from 'mercadopago';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Mercado Pago with lazy check
let mpClient: MercadoPagoConfig | null = null;
const getMPClient = () => {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return null;
  if (!mpClient) mpClient = new MercadoPagoConfig({ accessToken: token });
  return mpClient;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  /**
   * WEBHOOK: Handles real callbacks from Mercado Pago
   */
  app.post("/api/webhooks/payments", async (req, res) => {
    try {
      const client = getMPClient();
      if (!client) {
        console.warn("[Webhook] Skipping validation: MP_ACCESS_TOKEN not set");
        return res.status(200).send("OK (Simulation Mode)");
      }

      const { data, action } = req.body;
      
      // We only care about payment status updates
      if (action === "payment.updated" && data?.id) {
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: data.id });
        
        if (paymentData.status === "approved") {
          console.log(`[Webhook] Payment APPROVED: ${data.id}`);
          // Normally we would call confirmDeposit here
          // But since the webhook endpoint in AID is dynamic and might not be reachable by MP during dev,
          // we keep the manual simulation in the UI as a backup.
        }
      }
      
      res.status(200).send("OK");
    } catch (error) {
      console.error("[Webhook Error]:", error);
      res.status(500).send("Error");
    }
  });

  /**
   * GENERATE PIX: Calls real Mercado Pago API if token exists
   */
  app.post("/api/payments/pix", async (req, res) => {
    try {
      const { userId, amount, email } = req.body;
      
      if (!amount || amount < 5) {
        return res.status(400).json({ error: "Valor mínimo R$ 5,00" });
      }

      const token = process.env.MP_ACCESS_TOKEN;
      if (!token) {
        console.error("MP_ACCESS_TOKEN is MISSING in environment variables.");
      } else if (!token.startsWith("APP_USR-") && !token.startsWith("TEST-")) {
        console.warn("MP_ACCESS_TOKEN does not look like a valid Mercado Pago token (should start with APP_USR- or TEST-).");
      }

      const client = getMPClient();
      
      if (!client) {
        // FALLBACK TO SIMULATION if NO TOKEN provided
        const externalPaymentId = `sim_${Math.random().toString(36).substring(7)}`;
        const pixCopyPaste = `00020126580014BR.GOV.BCB.PIX0114ketto@pay.com27300012BR.COM.KETTO.PAY0503PIX5204000053039865405${amount.toFixed(2)}5802BR5905KETTO6009SAO PAULO62070503***6304${Math.floor(Math.random() * 9000 + 1000).toString(16)}`;
        
        return res.json({
          success: true,
          mode: "simulation",
          externalPaymentId,
          pixCopyPaste,
          pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCopyPaste)}`
        });
      }

      // REAL MERCADO PAGO INTEGRATION
      const payment = new Payment(client);
      const paymentResponse = await payment.create({
        body: {
          transaction_amount: Number(Number(amount).toFixed(2)),
          description: 'KettoPay - Recarga de Saldo',
          payment_method_id: 'pix',
          payer: {
            email: email || 'usuario@kettopay.com',
          }
          // Removing notification_url for now to ensure creation succeeds if domain is problematic for MP
        }
      });

      const qrCodePayload = paymentResponse.point_of_interaction?.transaction_data?.qr_code;

      res.json({
        success: true,
        mode: "production",
        externalPaymentId: paymentResponse.id?.toString(),
        pixCopyPaste: qrCodePayload,
        pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodePayload || '')}`
      });

    } catch (error: any) {
      // Detailed logging for debugging
      console.error("Error generating PIX. Details:");
      
      let errorMessage = "Erro desconhecido no gateway";
      
      if (error.response) {
        console.error("MP Response Error:", JSON.stringify(error.response, null, 2));
        errorMessage = error.response.message || errorMessage;
      } else {
        console.error("MP General Error:", error.message || error);
        errorMessage = error.message || errorMessage;
      }
      
      // Specialize message for "PIX Key missing" error
      if (errorMessage.includes("Collector user without key enabled")) {
        errorMessage = "A conta Mercado Pago configurada não possui uma chave PIX cadastrada. Por favor, cadastre uma chave PIX no painel do Mercado Pago para aceitar pagamentos.";
      }
      
      res.status(500).json({ 
        error: "Falha ao integrar com o Mercado Pago", 
        details: errorMessage 
      });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ketto Server running on http://localhost:${PORT}`);
  });
}

startServer();
