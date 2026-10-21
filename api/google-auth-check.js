
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      message: "Method not allowed"
    });
  }

  return res.status(200).json({
    ok: true,
    service: "walton-qm-api",
    stage: "google-auth-check",
    message: "Endpoint is running. Google authentication is not yet verified."
  });
}
