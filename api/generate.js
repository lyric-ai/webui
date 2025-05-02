import fetch from 'node-fetch';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const accessKey = "NRXABtFaq2nlj-fRV4685Q";
  const secretKey = "VnS-NP3SKlOgws0zGW8OfkpOm-vohzvf";

  const { flower, jellyfish } = req.body;

  if (!flower || !jellyfish) {
    return res.status(400).json({ error: "关键词不能为空" });
  }

  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substring(2, 15);
  const uri = "/api/generate/comfyui/app";

  const stringToSign = `${uri}&${timestamp}&${nonce}`;

  const signature = crypto.createHmac('sha1', secretKey)
    .update(stringToSign)
    .digest('base64')
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const queryParams = new URLSearchParams({
    AccessKey: accessKey,
    Signature: signature,
    Timestamp: timestamp,
    SignatureNonce: nonce
  });

  const body = {
    templateUuid: "4df2efa0f18d46dc9758803e478eb51c",
    generateParams: {
      "63": {
        class_type: "CLIPTextEncode",
        inputs: { text: jellyfish }
      },
      "65": {
        class_type: "CLIPTextEncode",
        inputs: { text: flower }
      }
    },
    workflowUuid: "5f7cf756fd804deeac558322dc5bd813"
  };

  try {
    const url = `https://openapi.liblibai.cloud${uri}?${queryParams.toString()}`;
    const libRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const text = await libRes.text();
    const data = JSON.parse(text);

    if (!libRes.ok || data?.code !== 0) {
      return res.status(500).json({ error: data?.msg || "生成失败" });
    }

    return res.status(200).json({ generateUuid: data.data.generateUuid });
  } catch (err) {
    return res.status(500).json({ error: "请求失败：" + err.message });
  }
}
