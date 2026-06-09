const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getField = (body, field) => String(body?.[field] || "").trim();

const sendJson = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
};

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { message: "Method not allowed." });
  }

  let body = {};

  try {
    body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  } catch (error) {
    return sendJson(response, 400, { message: "Invalid request body." });
  }

  if (getField(body, "companyWebsite")) {
    return sendJson(response, 200, { ok: true });
  }

  const name = getField(body, "name");
  const email = getField(body, "email");
  const projectType = getField(body, "projectType");
  const links = getField(body, "links");
  const summary = getField(body, "summary");
  const timeline = getField(body, "timeline");
  const budget = getField(body, "budget");

  if (!name || !email || !projectType || !summary) {
    return sendJson(response, 400, { message: "Name, email, project type, and project details are required." });
  }

  if (!process.env.RESEND_API_KEY) {
    return sendJson(response, 500, { message: "Intake email is not configured yet." });
  }

  const to = process.env.INTAKE_TO_EMAIL || "hexsolutions.dev@gmail.com";
  const from = process.env.INTAKE_FROM_EMAIL || "Hex Solutions <onboarding@resend.dev>";
  const isLogoRequest = projectType.toLowerCase().includes("logo");
  const isWebsiteRequest = projectType.toLowerCase().includes("website") || projectType.toLowerCase().includes("storefront");
  const isAutomationRequest = projectType.toLowerCase().includes("automation") || projectType.toLowerCase().includes("integration");
  const subjectPrefix = isLogoRequest
    ? "HEX LOGO REQUEST"
    : isWebsiteRequest
      ? "HEX WEBSITE REQUEST"
      : isAutomationRequest
        ? "HEX AUTOMATION REQUEST"
        : "HEX BUILD REQUEST";
  const subject = `[${subjectPrefix}] ${name} - ${projectType}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.55;">
      <h2>New Hex Solutions build request</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Project type:</strong> ${escapeHtml(projectType)}</p>
      <p><strong>Timeline:</strong> ${escapeHtml(timeline || "Not provided")}</p>
      <p><strong>Budget:</strong> ${escapeHtml(budget || "Not provided")}</p>
      <h3>Links / access</h3>
      <p>${escapeHtml(links || "No links provided").replace(/\n/g, "<br>")}</p>
      <h3>Project details</h3>
      <p>${escapeHtml(summary).replace(/\n/g, "<br>")}</p>
      <hr>
      <p>Ask them to invite <strong>hexsolutions.dev@gmail.com</strong> to GitHub, Lovable, Bolt, Replit, Vercel, or the relevant project workspace if access is still needed.</p>
    </div>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    console.error("Resend intake failed:", errorText);
    return sendJson(response, 502, { message: "The intake email could not be sent." });
  }

  return sendJson(response, 200, { ok: true });
};
