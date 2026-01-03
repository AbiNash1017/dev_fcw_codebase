'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const VendorUserCommunication = () => {
    const [messageType, setMessageType] = useState('update')

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Notify Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div>
                            <Label htmlFor="messageType">Message Type</Label>
                            <Select value={messageType} onValueChange={setMessageType}>
                                <SelectTrigger id="messageType">
                                    <SelectValue placeholder="Select message type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="update">Update</SelectItem>
                                    <SelectItem value="reminder">Reminder</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="Enter message subject" />
                        </div>
                        <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Enter your message here" rows={3} />
                        </div>
                        <Button className="bg-red-600 hover:bg-red-700 text-white">Send Message</Button>
                    </form>
                </CardContent>
            </Card>

            {/* <Card>
        <CardHeader>
          <CardTitle>User Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 1, user: 'John Doe', session: 'Yoga', rating: 4.5, comment: 'Great session, very relaxing!' },
              { id: 2, user: 'Jane Smith', session: 'HIIT', rating: 3, comment: 'Intense workout, loved it!' },
            ].map(feedback => (
              <div key={feedback.id} className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{feedback.user}</h4>
                    <p className="text-sm text-gray-500">{feedback.session}</p>
                  </div>
                  <div className="text-2xl text-yellow-500">{'★'.repeat(Math.round(feedback.rating))}</div>
                </div>
                <p className="mt-2">{feedback.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
        </div>
    )
}

export default VendorUserCommunication
