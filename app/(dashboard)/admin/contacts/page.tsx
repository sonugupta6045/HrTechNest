"use client"

import { useState, useEffect } from 'react'
import prisma from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { formatDistanceToNow, format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, X } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface Contact {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: Date
  updatedAt: Date
  status: string | null
  responseDate: Date | null
}

async function getContacts(): Promise<Contact[]> {
  // @ts-ignore
  return await prisma.contact.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Fetch contacts on component mount
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true)
      try {
        const result = await fetch('/api/contacts')
        const data = await result.json()
        setContacts(data)
      } catch (error) {
        console.error('Failed to fetch contacts:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load contact inquiries."
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  // Handle opening reply dialog
  const handleReply = (contact: Contact) => {
    setSelectedContact(contact)
    setReplyMessage(`Dear ${contact.name},\n\nThank you for contacting us regarding "${contact.subject}".\n\n\n\nBest regards,\nSupport Team`)
    setIsDialogOpen(true)
  }

  // Send response to contact
  const sendResponse = async () => {
    if (!selectedContact) return
    
    setSending(true)
    try {
      const response = await fetch('/api/send-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: selectedContact.id,
          to: selectedContact.email,
          subject: `Re: ${selectedContact.subject}`,
          message: replyMessage
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to send response')
      }
      
      // Update local state - mark as responded
      setContacts(contacts.map(c => 
        c.id === selectedContact.id 
          ? {...c, status: 'responded', responseDate: new Date()} 
          : c
      ))
      
      toast({
        title: "Response Sent",
        description: `Your response to ${selectedContact.name} has been sent.`
      })
      
      setIsDialogOpen(false)
      setReplyMessage('')
      setSelectedContact(null)
    } catch (error) {
      console.error('Error sending response:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send response. Please try again."
      })
    } finally {
      setSending(false)
    }
  }
  
  if (loading) {
    return <div className="container py-8">Loading contact inquiries...</div>
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Contact Inquiries</h1>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="all" className="text-base">All Inquiries</TabsTrigger>
          <TabsTrigger value="responded" className="text-base">Responded</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {contacts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No contact inquiries yet.</p>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id} className="mb-4 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium">{contact.subject}</h3>
                        <Badge className={contact.status === 'responded' ? 
                          "bg-green-100 text-green-800 border-green-200" : 
                          "bg-amber-100 text-amber-800 border-amber-200"
                        }>
                          {contact.status === 'responded' ? 'Responded' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="inline-block w-5">{/* User icon here if needed */}</span>
                        {contact.name} ({contact.email})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(contact.createdAt), 'MMM d, yyyy • h:mm a')}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="whitespace-pre-wrap">{contact.message}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      className="gap-2" 
                      onClick={() => handleReply(contact)}
                    >
                      <Mail className="h-4 w-4" />
                      Send Response
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="responded" className="space-y-4">
          {contacts.filter(c => c.status === 'responded').length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No responded inquiries yet.</p>
          ) : (
            contacts.filter(c => c.status === 'responded').map((contact) => (
              <Card key={contact.id} className="mb-4 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium">{contact.subject}</h3>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Responded
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="inline-block w-5">{/* User icon here if needed */}</span>
                        {contact.name} ({contact.email})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(contact.createdAt), 'MMM d, yyyy • h:mm a')}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="whitespace-pre-wrap">{contact.message}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      className="gap-2"
                      onClick={() => handleReply(contact)}
                    >
                      <Mail className="h-4 w-4" />
                      Send Response
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Send Response</DialogTitle>
            <DialogDescription>
              {selectedContact && (
                <span>Reply to {selectedContact.name} ({selectedContact.email})</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                value={selectedContact ? `Re: ${selectedContact.subject}` : ''} 
                readOnly 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                className="min-h-[200px]"
                placeholder="Type your response here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendResponse} disabled={sending || !replyMessage.trim()}>
              {sending ? 'Sending...' : 'Send Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 