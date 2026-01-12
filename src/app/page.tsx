"use client";

import { useState, useRef, useCallback } from "react";

const EXAMPLES = [
  {
    label: "Beauty",
    text: "피부 속 깊은 곳까지 촉촉하게!\n24시간 수분 유지 크림으로 빛나는 피부를 경험하세요.\n지금 바로 주문하시면 50% 할인!",
  },
  {
    label: "Food",
    text: "배고플 땐 배달의민족!\n클릭 한 번으로 맛있는 음식이 문 앞까지.\n첫 주문 무료 배달!",
  },
  {
    label: "Tech",
    text: "새로운 스마트폰이 당신의 일상을 바꿉니다.\n초고속 충전, 놀라운 카메라, 무한한 가능성.\n미래를 손에 쥐세요.",
  },
];

export default function Home() {
  const [textInput, setTextInput] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageData(e.target?.result as string);
      setImageName(file.name);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleSubmit = async () => {
    if (loading) return;
    if (!textInput.trim() && !imageData) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/localize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          koreanText: textInput.trim() || undefined,
          imageData: imageData || undefined,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAsImage = async () => {
    if (!resultCardRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (err) {
      console.error("Failed to copy as image:", err);
      handleCopyText();
    }
  };

  const handleDownloadImage = async () => {
    if (!resultCardRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = "meme-localized.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to download image:", err);
    }
  };

  const handleClear = () => {
    setTextInput("");
    setImageData(null);
    setImageName("");
    setResult(null);
    setError(null);
  };

  const isInputValid = textInput.trim() || imageData;

  return (
    <div className="bg-chaos min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-10 px-4 text-center relative">
        <div className="absolute top-4 right-4 text-xs font-mono text-gray-500">
          v2.0 chaos edition
        </div>
        <h1
          className="text-5xl md:text-7xl font-extrabold mb-3 glitch-text gradient-text"
          data-text="MZ Meme Cheat Key"
        >
          MZ Meme Cheat Key
        </h1>
        <p className="text-gray-400 text-lg font-mono tracking-wide">
          Korean Ad Copy → US Meme Magic
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <span className="meme-tag">no cap</span>
          <span className="meme-tag">fr fr</span>
          <span className="meme-tag">it&apos;s giving</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-12">
        {/* Input Section - Side by Side */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Text Input Card */}
          <div className="card p-6">
            <label className="block text-sm text-gray-400 mb-3 font-mono flex items-center gap-2">
              <span className="text-xl">📝</span> Text Input
            </label>
            <textarea
              className="chaos-textarea w-full p-4 text-white placeholder-gray-600 resize-none"
              rows={8}
              placeholder="한국어 광고 문구를 입력하세요..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />

            {/* Example Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs text-gray-500 font-mono">Examples:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setTextInput(ex.text)}
                  className="btn-ghost text-xs px-4 py-1.5 rounded-full text-gray-300"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload Card */}
          <div className="card p-6">
            <label className="block text-sm text-gray-400 mb-3 font-mono flex items-center gap-2">
              <span className="text-xl">📸</span> Image Upload
            </label>

            {!imageData ? (
              <div
                className={`upload-zone p-8 text-center h-[calc(100%-2rem)] min-h-[200px] flex flex-col items-center justify-center ${dragging ? "dragging" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                <div className="text-5xl mb-4">
                  {dragging ? "🔥" : "🖼️"}
                </div>
                <p className="text-gray-400 mb-2">
                  Drag & drop Korean ad image
                </p>
                <p className="text-gray-600 text-sm font-mono">
                  or click to browse
                </p>
              </div>
            ) : (
              <div className="image-preview bg-black/30 p-4 rounded-xl">
                <img src={imageData} alt="Uploaded" className="mx-auto max-h-[200px]" />
                <button
                  className="remove-btn text-white"
                  onClick={() => {
                    setImageData(null);
                    setImageName("");
                  }}
                >
                  ✕
                </button>
                <p className="text-center text-gray-500 text-xs font-mono mt-3">
                  {imageName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !isInputValid}
          className={`btn-fire w-full py-4 rounded-full text-white font-bold text-lg tracking-wide mb-8 ${
            loading ? "loading-chaos" : ""
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">🌀</span>
              bruh moment loading...
            </span>
          ) : (
            <>Localize It 🔥 {textInput && imageData && "(Text + Image)"}</>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="card p-5 mb-8 border-red-500/30 bg-red-500/5">
            <p className="text-red-400 font-mono text-sm flex items-center gap-2">
              <span>💀</span> {error}
            </p>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className="card p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold gradient-text">Result</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopyText}
                  className={`btn-ghost px-5 py-2 rounded-full text-sm font-semibold ${
                    copied ? "copy-success" : "text-white"
                  }`}
                >
                  {copied ? "Copied! ✓" : "Copy Text"}
                </button>
                <button
                  onClick={handleCopyAsImage}
                  className="btn-ghost px-5 py-2 rounded-full text-sm font-semibold text-white"
                >
                  Copy as Image
                </button>
                <button
                  onClick={handleDownloadImage}
                  className="btn-ghost px-5 py-2 rounded-full text-sm font-semibold text-white"
                >
                  Download PNG
                </button>
                <button
                  onClick={handleClear}
                  className="btn-ghost px-5 py-2 rounded-full text-sm font-semibold text-white"
                >
                  Try Another
                </button>
              </div>
            </div>

            {/* Shareable Result Card */}
            <div
              ref={resultCardRef}
              className="result-card rounded-2xl p-6"
            >
              <div className="space-y-4">
                {result.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) {
                    return (
                      <h3
                        key={i}
                        className="text-xl font-bold mt-6 mb-3"
                        style={{ color: "#00f2ea" }}
                      >
                        {line.replace("## ", "")}
                      </h3>
                    );
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <p key={i} className="text-gray-300 ml-4 font-mono text-sm">
                        {line}
                      </p>
                    );
                  }
                  if (line.trim()) {
                    return (
                      <p key={i} className="text-gray-100 leading-relaxed">
                        {line}
                      </p>
                    );
                  }
                  return <div key={i} className="h-2" />;
                })}
              </div>

              {/* Watermark for shared images */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
                <span className="text-xs text-gray-500 font-mono">
                  Made with MZ Meme Cheat Key
                </span>
                <span className="text-xs gradient-text font-bold">
                  🔥 no cap fr fr
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-gray-600 text-sm font-mono">
          Powered by Gemini AI | Made with chaos
        </p>
        <p className="text-gray-700 text-xs mt-2">
          v2.0 — text + image input | shareable cards
        </p>
      </footer>
    </div>
  );
}
