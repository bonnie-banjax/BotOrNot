// snitches.js

export function getGPUInfo() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return null;
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return null;
    return {
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
    };
  } catch {
    return null;
  }
}

export function getMemoryInfo() {
  if (performance && performance.memory) {
    return {
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      usedJSHeapSize: performance.memory.usedJSHeapSize,
    };
  }
  return null;
}

export function getNavigationTiming() {
  try {
    const navEntry = performance.getEntriesByType?.("navigation")?.[0];
    if (!navEntry) return null;

    return {
      dnsTime: navEntry.domainLookupEnd - navEntry.domainLookupStart,
      connectTime: navEntry.connectEnd - navEntry.connectStart,
      tlsTime: navEntry.secureConnectionStart ? navEntry.connectEnd - navEntry.secureConnectionStart : 0,
      ttfb: navEntry.responseStart - navEntry.requestStart,
      downloadTime: navEntry.responseEnd - navEntry.responseStart,
      domInteractive: navEntry.domInteractive,
      domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
      loadEventTime: navEntry.loadEventEnd - navEntry.loadEventStart,
      type: navEntry.type,
      redirectCount: navEntry.redirectCount,
    };
  } catch {
    return null;
  }
}

export async function getBatteryTelemetry() {
  if (typeof navigator.getBattery !== "function") return null;
  try {
    const battery = await navigator.getBattery();
    return {
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
      level: battery.level,
    };
  } catch {
    return null;
  }
}

export async function getMediaDevicesInfo() {
  if (!navigator.mediaDevices?.enumerateDevices) return null;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      audioInputCount: devices.filter((d) => d.kind === "audioinput").length,
      audioOutputCount: devices.filter((d) => d.kind === "audiooutput").length,
      videoInputCount: devices.filter((d) => d.kind === "videoinput").length,
      hasDeviceLabels: devices.some((d) => d.label !== ""),
    };
  } catch {
    return null;
  }
}

export async function getAudioFingerprint() {
  try {
    const AudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AudioCtx) return null;

    const context = new AudioCtx(1, 44100, 44100);
    const oscillator = context.createOscillator();
    const compressor = context.createDynamicsCompressor();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    compressor.threshold.setValueAtTime(-50, context.currentTime);
    compressor.knee.setValueAtTime(40, context.currentTime);
    compressor.ratio.setValueAtTime(12, context.currentTime);
    compressor.attack.setValueAtTime(0, context.currentTime);
    compressor.release.setValueAtTime(0.25, context.currentTime);

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const renderedBuffer = await context.startRendering();
    const channelData = renderedBuffer.getChannelData(0);

    let hash = 0;
    for (let i = 4500; i < 5000; i++) {
      hash += Math.abs(channelData[i]);
    }
    return hash.toString();
  } catch {
    return null;
  }
}

export function getCanvas2DFingerprint() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = "#069";
    ctx.fillText("Telemetry, <canvas> 123!", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Telemetry, <canvas> 123!", 4, 17);

    return canvas.toDataURL();
  } catch {
    return null;
  }
}

export function getInstalledFontProfile() {
  try {
    const baseFonts = ["monospace", "sans-serif", "serif"];
    const testFonts = [
      "Arial", "Courier New", "Georgia", "Times New Roman", "Trebuchet MS",
      "Verdana", "Calibri", "Comic Sans MS", "Impact", "Segoe UI",
      "Ubuntu", "Roboto", "PingFang SC", "Helvetica Neue"
    ];

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];

    const text = "mmmmmmmmmlli";
    const fontSize = "72px";

    const baselines = {};
    for (const base of baseFonts) {
      ctx.font = `${fontSize}${base}`;
      baselines[base] = ctx.measureText(text).width;
    }

    const detected = [];
    for (const font of testFonts) {
      for (const base of baseFonts) {
        ctx.font = `${fontSize} '${font}',${base}`;
        const width = ctx.measureText(text).width;
        if (width !== baselines[base]) {
          detected.push(font);
          break;
        }
      }
    }
    return detected;
  } catch {
    return [];
  }
}

export function getSpeechVoices() {
  if (!("speechSynthesis" in window)) return null;
  try {
    const voices = window.speechSynthesis.getVoices();
    return voices.map((v) => ({
      name: v.name,
      lang: v.lang,
      default: v.default,
      localService: v.localService,
    }));
  } catch {
    return null;
  }
}