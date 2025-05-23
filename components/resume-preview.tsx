"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CustomDialogTrigger } from "@/components/ui/custom-dialog-trigger"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResumePreviewProps {
  resumeUrl: string
  candidateName: string
}

export function ResumePreview({ resumeUrl, candidateName }: ResumePreviewProps) {
  return (
    <Dialog>
      <CustomDialogTrigger>
        <div
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-medium"
          role="button"
          tabIndex={0}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">Preview resume</span>
        </div>
      </CustomDialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Resume Preview - {candidateName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {/* Option 1: Using <object> for better PDF rendering */}
          <object
            data={resumeUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            className="min-h-[60vh]"
          >
            <p className="text-sm text-muted-foreground">
              Cannot preview PDF.{" "}
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
                Click here to download or view it in a new tab
              </a>.
            </p>
          </object>

          {/* 
          Option 2: Uncomment this to use Google Docs Viewer (for CORS-safe embedding)
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(resumeUrl)}&embedded=true`}
            className="w-full h-full min-h-[60vh]"
            title={`Resume of ${candidateName}`}
          />
          */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
