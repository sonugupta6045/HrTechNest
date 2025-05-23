import { NextResponse } from "next/server"
import { writeFile, unlink, stat } from "fs/promises"
import { exec } from "child_process"
import { promisify } from "util"
import { join } from "path"
import { tmpdir } from "os"

const execAsync = promisify(exec)

export async function POST(request: Request) {
  let tempFilePath = ""
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Extract filename and check extension
    const fileName = file.name || ""
    const isValidExtension = fileName.toLowerCase().endsWith(".pdf") ||
                            fileName.toLowerCase().endsWith(".doc") || 
                            fileName.toLowerCase().endsWith(".docx")
    
    if (!isValidExtension) {
      return NextResponse.json({ 
        error: "Invalid file type. Please upload a PDF, DOC, or DOCX file."
      }, { status: 400 })
    }

    // Convert file to buffer and save temporarily
    const buffer = Buffer.from(await file.arrayBuffer())
    tempFilePath = join(tmpdir(), `resume-${Date.now()}.pdf`)
    await writeFile(tempFilePath, buffer)

    try {
      // Get Gemini API key from environment variable
      const geminiApiKey = process.env.GEMINI_API_KEY || ""

      // Run Python script to parse resume
      const scriptPath = join(process.cwd(), "scripts", "resume_parser_gemini.py")
      const filePath = `"${tempFilePath}"`; // Handle spaces in the file path
      
      // Only pass the API key as argument if it exists
      const apiKeyArg = geminiApiKey ? `--api_key "${geminiApiKey}"` : ""
      
      const { stdout, stderr } = await execAsync(`python "${scriptPath}" ${filePath} ${apiKeyArg}`)

      if (stderr && !stderr.includes("WARNING") && !stderr.includes("Using Gemini API key")) {
        console.error("Python script error:", stderr)
        // Try the traditional parser if Gemini parser fails
        const fallbackScriptPath = join(process.cwd(), "scripts", "resume_parser.py")
        const { stdout: fallbackStdout, stderr: fallbackStderr } = await execAsync(`python "${fallbackScriptPath}" ${filePath}`)
        
        if (fallbackStderr) {
          console.error("Fallback parser error:", fallbackStderr)
          return fallbackParsing(file.name || "")
        }
        
        try {
          const parsedData = JSON.parse(fallbackStdout)
          return NextResponse.json(parsedData)
        } catch (jsonError) {
          console.error("Failed to parse fallback script output:", jsonError)
          return fallbackParsing(file.name || "")
        }
      }

      // Parse the JSON output from Python script
      try {
        const parsedData = JSON.parse(stdout)
        return NextResponse.json(parsedData)
      } catch (jsonError) {
        console.error("Failed to parse Python script output:", jsonError)
        return fallbackParsing(file.name || "")
      }
    } catch (pythonError) {
      console.error("Failed to run Python script:", pythonError)
      return fallbackParsing(file.name || "")
    }
  } catch (error) {
    console.error("Error parsing resume:", error)
    return NextResponse.json(
      { error: "Failed to parse resume", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  } finally {
    // Ensure file exists before attempting cleanup
    if (tempFilePath) {
      try {
        // Use stat to check if the file exists before deleting
        try {
          await stat(tempFilePath) // Check file existence
          await unlink(tempFilePath) // If file exists, delete it
        } catch (cleanupError) {
          console.error("Error cleaning up temporary file:", cleanupError)
        }
      } catch (statError) {
        console.error("File not found during cleanup:", statError)
      }
    }
  }
}

// Fallback function to extract minimal information when parsing fails
function fallbackParsing(filename: string) {
  let name = ""
  if (filename) {
    name = filename.replace(/\.(pdf|doc|docx)$/i, "")
                   .replace(/[_-]/g, " ")
                   .trim()
    name = name.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    })
  }

  return NextResponse.json({
    name: name || "",
    email: "",
    phone: "",
    skills: [],
    experience: "",
    matchScore: 0,
    education: {
      tenth: {
        school: "",
        year: "",
        percentage: ""
      },
      twelfth: {
        school: "",
        year: "",
        percentage: ""
      }
    },
    note: "Automatic parsing failed. Please fill in your details manually."
  })
}
