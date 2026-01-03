'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowDown, ArrowRight, Mail, Phone } from 'lucide-react'
import { motion } from 'framer-motion'

const Contact = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  return (
    <section id='contact' className='bg-black py-12'>
      <div className="container max-w-7xl mx-auto px-4">
        <motion.h3
          className='text-4xl md:text-5xl font-bold text-center mb-12 text-white'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          CONTACT US
        </motion.h3>
        {/* <div className='flex flex-col md:flex-row justify-between items-start gap-12'> */}
        <motion.div
          className='flex flex-col justify-center items-center space-y-3'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h4 className='text-2xl font-semibold text-white mb-4'>Get in Touch</h4>
          <p className='text-gray-300 mb-6'>Feel free to reach out to us for any questions:</p>
          <div className='flex items-center text-white'>
            <Phone className='mr-3 text-white' />
            <span className='text-lg'>+91 9036815005</span>
          </div>
          <div className='flex items-center text-white'>
            <Mail className='mr-3 text-white' />
            <span className='text-lg'>info@fitchoiceworld.com</span>
          </div>
          {/* <p className='text-gray-300 mt-6'>
              Or message us directly through this form! <ArrowRight  className='inline ml-2 text-red-600' />
            </p> */}
        </motion.div>
        {/* <motion.div 
            className='flex-1'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className='bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8 shadow-xl'>
              <h4 className='text-2xl font-semibold text-white mb-6'>Send us a Message</h4>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-1' htmlFor='name'>Your Name</label>
                  <Input
                    type='text'
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='w-full bg-white bg-opacity-20 text-white placeholder-gray-400 border-none'
                    placeholder='John Doe'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-1' htmlFor='email'>Your Email</label>
                  <Input
                    type='email'
                    id='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full bg-white bg-opacity-20 text-white placeholder-gray-400 border-none'
                    placeholder='john@example.com'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-1' htmlFor='message'>Message</label>
                  <Textarea
                    id='message'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className='w-full bg-white bg-opacity-20 text-white placeholder-gray-400 border-none'
                    rows={3}
                    placeholder='Your message here...'
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-300">
                  Send Message
                </Button>
              </form>
            </div>
          </motion.div> */}
        {/* </div> */}
      </div>
    </section>
  )
}

export default Contact
