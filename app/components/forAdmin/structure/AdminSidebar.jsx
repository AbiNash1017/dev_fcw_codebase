'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const AdminSidebar = ({ tabs, activeTab, setActiveTab }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <aside className={`bg-[#5d1212] dark:bg-gray-800 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-60'} flex flex-col`}>
            <div className='flex justify-between items-center p-4 h-16'>
                <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-2'} transition-all duration-300 ease-in-out`}>
                    <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} overflow-hidden`}>
                        <div className='border border-white rounded-full border-x-2 border-y-2'>
                            <Image className='border-none rounded-full' src={'/images/fcw_logo.png'} alt={'fcw'} width={38} height={38} />
                        </div>
                    </div>
                    <span className={`text-[20px] text-white font-bold whitespace-nowrap transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} overflow-hidden`}>
                        Admin Panel
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`text-white hover:bg-transparent transition-all duration-300 ease-in-out ${isCollapsed ? 'relative right-2' : ''}`}
                >
                    {isCollapsed ? <Menu className="h-6 w-6 text-white" /> : <X className="h-6 w-6 text-white" />}
                </Button>
            </div>
            <nav className="flex-grow px-2 pb-4">
                {tabs.map((tab) => (
                    <Button
                        key={tab.id}
                        className={`w-full justify-start mb-2 text-white border-none transition-all duration-300 ease-in-out ${activeTab === tab.id
                                ? "bg-red-800 hover:bg-red-800"
                                : "bg-opacity-10 bg-yellow-300 hover:bg-yellow-600 hover:bg-opacity-15"
                            } ${isCollapsed ? 'px-4' : 'px-4'}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon className={`h-4 w-4 text-white transition-all duration-300 ease-in-out ${isCollapsed ? 'mr-0' : 'mr-2'}`} />
                        <span className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} overflow-hidden whitespace-nowrap`}>
                            {tab.label}
                        </span>
                    </Button>
                ))}
            </nav>
        </aside>
    )
}

export default AdminSidebar
