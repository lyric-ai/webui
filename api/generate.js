
export default async function(req, res) {
  const body = await req.json?.() || req.body;
  const response = await fetch("https://openapi.liblibai.cloud/api/generate/comfyui/app", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  res.status(200).json(data.data || {});
}
