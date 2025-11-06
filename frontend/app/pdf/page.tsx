"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, Loader, File, Trash2 } from "lucide-react"

export default function PDFChatPage() {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; id: string } | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([])
  const [query, setQuery] = useState("")
  const [isQuerying, setIsQuerying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
        setFileName(selectedFile.name)
      } else {
        alert("Please select a PDF file")
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://localhost:8000/process-pdf", {
        method: "POST",
        body: formData,
        credentials: "include", // if using cookies
      })

      if (response.ok) {
        const data = await response.json()
        const clientFileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setUploadedFile({ name: fileName, id: clientFileId })
        setFile(null)
        setFileName("")
        setChatMessages([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        console.log("PDF processed:", data.message)
      } else {
        if (response.status === 422) {
          const errorData = await response.json()
          console.error("Validation error:", errorData.detail)
          alert("Invalid file format. Please upload a valid PDF file.")
        } else {
          const errorText = await response.text()
          console.error("Upload failed:", errorText)
          alert("Failed to process PDF. Please try again.")
        }
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Error uploading PDF. Please check your connection and try again.")
    } finally {
      setIsUploading(false)
    }
  }
  const handleQuery = async () => {
    if (!query.trim() || !uploadedFile) return

    const userMessage = { role: "user", content: query }
    setChatMessages((prev) => [...prev, userMessage])
    setQuery("")
    setIsQuerying(true)

    try {
      const response = await fetch("http://localhost:8000/query-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: query,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.answer }])
      } else {
        setChatMessages((prev) => [...prev, { role: "assistant", content: "Error processing query" }])
      }
    } catch (error) {
      console.error("Query error:", error)
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Error communicating with server" }])
    } finally {
      setIsQuerying(false)
    }
  }

  const handleRemoveFile = async  () => {

    const deleteFile = await fetch("http://localhost:8000/delete-pdf", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    const res = await deleteFile.json();
    console.log(res);
    
    setUploadedFile(null)
    setChatMessages([])
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">PDF Chat</h1>
        </div>
      </div>

      <div className="w-full mt-16 flex flex-col">
        {!uploadedFile ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/70 to-foreground/40 bg-clip-text text-transparent">
                    Upload PDF
                  </div>
                  <p className="text-foreground/60">Upload a PDF and ask questions about its content</p>
                </div>

                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-foreground/40 transition-colors group"
                >
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-lg bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
                        <Upload
                          size={32}
                          className="text-foreground/40 group-hover:text-foreground/60 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-foreground/50">PDF files only</p>
                    </div>
                  </div>
                </div>

                {/* Selected File */}
                {fileName && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-foreground/5 border border-border">
                      <File size={20} className="text-foreground/60" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full py-3 px-4 rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload & Continue"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* File Info */}
            <div className="border-b border-border bg-foreground/5 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File size={20} className="text-foreground/60" />
                <div>
                  <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-xs text-foreground/50">Ready to chat</p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 rounded-lg hover:bg-foreground/10 transition-colors text-foreground/60 hover:text-foreground"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <p className="text-foreground/60">Ask a question about the PDF...</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xl rounded-lg px-4 py-2 ${msg.role === "user"
                          ? "bg-foreground text-background max-w-md"
                          : "bg-foreground/10 border border-border text-foreground w-2xl"
                        }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isQuerying && (
                <div className="flex justify-start">
                  <div className="bg-foreground/10 border border-border text-foreground rounded-lg px-4 py-2">
                    <Loader size={18} className="animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-6 bg-foreground/5">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleQuery()}
                  placeholder="Ask about the PDF content..."
                  className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
                <button
                  onClick={handleQuery}
                  disabled={isQuerying || !query.trim()}
                  className="px-6 py-2 rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {isQuerying ? <Loader size={18} className="animate-spin" /> : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

