'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import React from 'react'

const Testimonials = () => {
    return (
        // <div className="h-[20rem] rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
        //   <InfiniteMovingCards
        //     items={testimonial}
        //     direction="right"
        //     speed="normal"
        //   />
        // </div>
        <section id="testimonials" className="py-24 bg-[var(--landing-bg-secondary)]">
            <div className="container mx-auto px-12">
                <h2 className="text-3xl md:text-[43px] font-bold text-center mb-12 text-[var(--landing-text-primary)]">WHAT OUR <span className='text-[var(--landing-accent)]'>USERS</span> SAY</h2>
                <div className="grid md:grid-cols-3 gap-8 px-4">
                    {[
                        { name: "Somnath U", quote: "Fit Choice World has transformed my fitness routine. I've discovered amazing classes I never knew existed!", rating: 4 },
                        { name: "Manas Hejmadi", quote: "I found someone who shares my love for fitness and me. Every workout feels better together now — thank you, Fit Choice World!", rating: 5 },
                        { name: "Koushik M B", quote: "As a gym owner, Fit Choice World has helped me reach new clients and streamline my booking process.", rating: 5 },
                    ].map((testimonial, index) => (
                        <Card key={index} className="border-[var(--landing-border)] border rounded-[2rem] bg-white text-[var(--landing-text-primary)] hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <CardTitle>{testimonial.name}</CardTitle>
                                <CardDescription>
                                    {Array(testimonial.rating).fill(0).map((_, i) => (
                                        <Star key={i} className="inline-block w-5 h-5 text-black fill-current" />
                                    ))}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="italic text-[var(--landing-text-secondary)]">"{testimonial.quote}"</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonials
