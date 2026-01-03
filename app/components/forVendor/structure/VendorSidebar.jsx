'use client'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react'

import { Plus, Trash2, X } from 'lucide-react'

const VendorSidebar = ({ tabs, activeTab, setActiveTab, availableFacilities = [], onAddFacility, onDeleteFacility }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const predefinedFacilities = ['GYM', 'YOGA', 'ZUMBA', 'PERSONAL TRAINING', 'SWIMMING'] // Updated list

    const handleAddFacilityClick = (facility) => {
        onAddFacility(facility)
        setIsModalOpen(false)
    }

    // Filter out facilities that are already added
    const availableOptions = predefinedFacilities.filter(f => !availableFacilities.includes(f))

    return (
        <>
            <aside className={`bg-black dark:bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'} flex flex-col shadow-xl z-20`}>
                <div className='flex justify-between items-center p-6 h-20 border-b border-gray-800'>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'} transition-all duration-300 ease-in-out`}>
                        <div
                            className="flex-shrink-0 transition-all duration-300 ease-in-out cursor-pointer hover:opacity-80"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <div className='relative w-10 h-10'>
                                <Image className='rounded-full object-cover' src={'/images/fcw_transparent.png'} alt={'fcw'} fill />
                            </div>
                        </div>
                        <span className={`text-lg text-white font-bold whitespace-nowrap tracking-wide transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'} overflow-hidden`}>
                            Vendor Panel
                        </span>
                    </div>
                </div>
                <nav className="flex-grow px-3 py-6 space-y-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
                    {/* Main Tabs */}
                    {tabs.filter(t => t.id !== 'facilities' && t.id !== 'facility_sessions').map((tab) => (
                        <Button
                            key={tab.id}
                            variant="ghost"
                            className={`w-full justify-start mb-1 text-sm font-medium transition-all duration-200 ease-in-out h-12 rounded-xl ${activeTab === tab.id
                                ? "bg-white text-black shadow-lg"
                                : "text-gray-400 hover:bg-gray-900 hover:text-white"
                                } ${isCollapsed ? 'px-0 justify-center' : 'px-4'}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon className={`h-5 w-5 transition-all duration-300 ${activeTab === tab.id ? "text-black" : "text-gray-400 group-hover:text-white"} ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                            <span className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0 absolute' : 'w-auto opacity-100'} overflow-hidden whitespace-nowrap`}>
                                {tab.label}
                            </span>
                        </Button>
                    ))}

                    <div className="my-4 border-t border-gray-800"></div>

                    {/* Facility Session Management Section */}
                    {/* The main tab for "Facility Session Management" (Calendar icon) is now implicit or acts as a header? 
                        User request: "if user selects one of the facility from there then it should be shown facility session managemant"
                        It also says "there in the side bar itseld the user should hae the option to delet facility"
                    */}

                    <div className={`px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isCollapsed ? 'hidden' : 'block'}`}>
                        Facility Sessions
                    </div>

                    {/* Add Facilities Tab - Opens Modal */}
                    <Button
                        variant="ghost"
                        className={`w-full justify-start mb-1 text-sm font-medium transition-all duration-200 ease-in-out h-12 rounded-xl text-green-400 hover:bg-gray-900 hover:text-green-300 ${isCollapsed ? 'px-0 justify-center' : 'px-4'}`}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className={`h-5 w-5 transition-all duration-300 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                        <span className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0 absolute' : 'w-auto opacity-100'} overflow-hidden whitespace-nowrap`}>
                            Add Facility
                        </span>
                    </Button>

                    {/* Dynamic Facility List */}
                    {availableFacilities.map((facility) => (
                        <div key={facility} className="relative group">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start mb-1 text-sm font-medium transition-all duration-200 ease-in-out h-12 rounded-xl ${activeTab === `facility_${facility}`
                                    ? "bg-white text-black shadow-lg"
                                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                                    } ${isCollapsed ? 'px-0 justify-center' : 'px-4'}`}
                                onClick={() => setActiveTab(`facility_${facility}`)}
                            >
                                {/* Using a generic dumbbell/activity icon for all, or specific if mapped */}
                                <span className={`h-2 w-2 rounded-full bg-blue-500 ${isCollapsed ? 'mr-0' : 'mr-3'}`}></span>
                                <span className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0 absolute' : 'w-auto opacity-100'} overflow-hidden whitespace-nowrap capitalize`}>
                                    {facility.toLowerCase()}
                                </span>
                            </Button>
                            {!isCollapsed && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteFacility(facility);
                                    }}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Facility"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}

                </nav>
                <div className='p-4 border-t border-gray-800 flex justify-center'>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-300"
                    >
                        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </Button>
                </div>
            </aside>

            {/* Add Facility Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold dark:text-white">Add New Facility</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6">
                            {availableOptions.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {availableOptions.map((facility) => (
                                        <button
                                            key={facility}
                                            onClick={() => handleAddFacilityClick(facility)}
                                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                                        >
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white">
                                                {facility}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    All available facilities have been added.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default VendorSidebar
