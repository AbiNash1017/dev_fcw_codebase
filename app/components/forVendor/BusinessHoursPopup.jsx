'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock } from 'lucide-react';

const BusinessHoursPopup = ({ isOpen, onRedirect }) => {
    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-2 text-yellow-600 mb-2">
                        <Clock className="w-6 h-6" />
                        <AlertDialogTitle>Action Required: Business Hours</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-gray-600">
                        Please update your fitness center's business hours. It is mandatory to provide your schedule and holiday information to ensure users know when you are open.
                        <br /><br />
                        You cannot close this popup until you visit the profile section to add them.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onRedirect} className="bg-black hover:bg-gray-800 text-white">
                        Go to Profile Settings
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default BusinessHoursPopup;
