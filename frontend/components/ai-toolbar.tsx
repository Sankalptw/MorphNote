"use client"

import { useState } from "react"
import { Sparkles, Copy, Loader2, Check } from "lucide-react"


interface AIToolbarProps {
  content: string
  onContentUpdate: (updates: { content: string }) => void
}


interface RestyleOptions {
  style: "formal" | "professional" | "creative" | "concise" | "casual" | "technical"
  length: "low" | "medium" | "high"
  creativity: "low" | "balanced" | "high"
}

export default function AIToolbar({ content, onContentUpdate }: AIToolbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showRestyleModal, setShowRestyleModal] = useState(false)
  const [restyleOptions, setRestyleOptions] = useState<RestyleOptions>({
    style: "professional",
    length: "medium",
    creativity: "balanced",
  })
  const [result, setResult] = useState("")
  const [resultType, setResultType] = useState<"summarize" | "keypoints" | "restyle" | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResultType("summarize");

    try {
      const response = await fetch("http://localhost:8000/summarize_text/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      });

      const data = await response.json();
      setResult(data.summary);
      setIsOpen(true);
    } catch (error) {
      console.error("Error:", error);
      setResult("Error processing request");
    } finally {
      setLoading(false);
    }
  };
  const handleExtractKeyPoints = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResultType("keypoints");

    try {
      const response = await fetch("http://127.0.0.1:8000/keypoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.keypoints);
      setIsOpen(true);
    } catch (error) {
      console.error("Error:", error);
      setResult("Error processing request");
    } finally {
      setLoading(false);
    }
  };


  const handleRestyle = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResultType("restyle");

    try {
      const response = await fetch("http://127.0.0.1:8000/stylize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          style: restyleOptions.style,
          options: {
            length: restyleOptions.length,
            creativity: restyleOptions.creativity,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.stylized_text);
      setShowRestyleModal(false);
      setIsOpen(true);
    } catch (error) {
      console.error("Error:", error);
      setResult("Error processing request");
    } finally {
      setLoading(false);
    }
  };


  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // const insertResult = () => {
  //   onContentUpdate(result)
  //   setIsOpen(false)
  // }

  const replaceContent = () => {
  if (!result.trim()) return
  onContentUpdate({ content: result }) 
  setIsOpen(false)
}


  return (
    <>
      <div className="flex items-center gap-2 px-8 py-4 border-b border-border bg-background/50 backdrop-blur-sm">
        <button
          onClick={handleSummarize}
          disabled={loading || !content.trim()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground/80 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && resultType === "summarize" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Summarize
        </button>

        <button
          onClick={handleExtractKeyPoints}
          disabled={loading || !content.trim()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground/80 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && resultType === "keypoints" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Extract Key Points
        </button>

        <button
          onClick={() => setShowRestyleModal(true)}
          disabled={loading || !content.trim()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground/80 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && resultType === "restyle" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Restyle
        </button>
      </div>

      {showRestyleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-sidebar rounded-lg p-6 w-96 max-w-full shadow-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">Restyle Options</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-3">Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {["formal", "professional", "creative", "concise", "casual", "technical"].map((style) => (
                    <button
                      key={style}
                      onClick={() => setRestyleOptions({ ...restyleOptions, style: style as RestyleOptions["style"] })}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${restyleOptions.style === style
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "bg-foreground/5 text-foreground/80 hover:bg-foreground/10"
                        }`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-3">Length</label>
                <div className="flex gap-2">
                  {["low", "medium", "high"].map((length) => (
                    <button
                      key={length}
                      onClick={() =>
                        setRestyleOptions({ ...restyleOptions, length: length as RestyleOptions["length"] })
                      }
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${restyleOptions.length === length
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "bg-foreground/5 text-foreground/80 hover:bg-foreground/10"
                        }`}
                    >
                      {length.charAt(0).toUpperCase() + length.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-3">Creativity</label>
                <div className="flex gap-2">
                  {["low", "balanced", "high"].map((creativity) => (
                    <button
                      key={creativity}
                      onClick={() =>
                        setRestyleOptions({ ...restyleOptions, creativity: creativity as RestyleOptions["creativity"] })
                      }
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${restyleOptions.creativity === creativity
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "bg-foreground/5 text-foreground/80 hover:bg-foreground/10"
                        }`}
                    >
                      {creativity.charAt(0).toUpperCase() + creativity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRestyleModal(false)}
                className="flex-1 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-md font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRestyle}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-md font-medium transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-sidebar rounded-lg p-6 w-96 max-w-full max-h-96 shadow-xl border border-border overflow-auto">
            <h3 className="text-lg font-semibold text-foreground mb-4 capitalize">
              {resultType === "summarize" && "Summary"}
              {resultType === "keypoints" && "Key Points"}
              {resultType === "restyle" && "Restyled Text"}
            </h3>
            <p className="text-foreground/80 text-sm mb-6 whitespace-pre-wrap leading-relaxed">{result}</p>

            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${isCopied
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-foreground/5 hover:bg-foreground/10 text-foreground"
                  }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={replaceContent}
                className="flex-1 px-4 py-2 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-md font-medium transition-all duration-200"
              >
                Use Text
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-md font-medium transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
