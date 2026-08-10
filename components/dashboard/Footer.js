import Link from "next/link";
import {
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { useState } from "react";
import TermsAndConditions from '@/components/terms';
import Policy from "@/components/Policy";
export default function Footer() {
    const [showTerms, setShowTerms] = useState(false);
    const [showPolicy, setShowPolicy] = useState(false);
    return (
        <footer className="border-t border-[#8B5CF6] bg-white">
            <div className="max-w-7xl mx-auto px-6 py-14">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 ">

                    {/* Logo */}
                    <div >
                        <div className="flex items-center  gap-3">
                            <img
                                src="/MM_LOGO1.png"
                                alt="MockMingle"
                                className="w-14 h-14 object-contain"
                            />

                            <h2 className="text-[24px] font-semibold text-[#6F24E8]">
                                MockMingle
                            </h2>
                        </div>

                        <p className="mt-5 text-[#000000] text-[16px] leading-6 max-w-xs ">
                            AI-powered mock interviews &
                            <br className="hidden md:block" />
                            real-time career insights.
                        </p>

                        <div className="flex gap-5 mt-6">
                            <FaFacebook className="w-5 h-5 cursor-pointer hover:text-[#6F24E8]" />
                            <FaInstagram className="w-5 h-5 cursor-pointer hover:text-[#6F24E8]" />
                            <FaTwitter className="w-5 h-5 cursor-pointer hover:text-[#6F24E8]" />
                            <FaLinkedin className="w-5 h-5 cursor-pointer hover:text-[#6F24E8]" />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div >
                        <h3 className="text-[#6F24E8] font-semibold text-xl mb-6 uppercase">
                            Quick Actions
                        </h3>

                        <div className="space-y-4 text-[18px]">
                            <Link href="/dashboard" className="block hover:text-[#6F24E8]">
                                Dashboard
                            </Link>

                            <Link href="/progress" className="block hover:text-[#6F24E8]">
                                Progress
                            </Link>

                            <Link href="/soft-skills" className="block hover:text-[#6F24E8]">
                                Soft Skills
                            </Link>

                            <Link href="/suggestion" className="block hover:text-[#6F24E8]">
                                Learn
                            </Link>

                            <Link href="/jobHistory" className="block hover:text-[#6F24E8]">
                                Job History
                            </Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-[#6F24E8] font-semibold text-xl mb-6 uppercase">
                            Contact Us
                        </h3>

                        <div className="space-y-5 text-[17px] text-[#222]">

                            <div>
                                <p className="font-medium">Call:</p>
                                <p>+91 8956668867</p>
                            </div>

                            <div>
                                <p className="font-medium">Email:</p>
                                <p>info@shakktii.in</p>
                            </div>

                            <div>
                                <p className="font-medium">Address:</p>
                                <p>
                                    Shakktii AI,
                                    <br />
                                    145, Sadashiv Peth,
                                    <br />
                                    Perugate, Pune 411030
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-[#6F24E8] font-semibold text-xl mb-6 uppercase">
                            Legal
                        </h3>

                        <div className="space-y-5 text-[18px]">
                            <button
                                onClick={() => setShowTerms(true)}
                                className="block hover:text-[#6F24E8]"
                            >
                                Terms & Conditions
                            </button>

                            <button
                                onClick={() => setShowPolicy(true)}
                                className="block hover:text-[#6F24E8]"
                            >
                                Privacy Policy
                            </button>

                            <Link href="/dashboard" className="block hover:text-[#6F24E8]">
                                Refund & Cancellation
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom */}
            <div className="bg-[#6F24E8] py-5">
                <div className="text-center text-white text-xl font-medium">
                    Created with ❤️ by{" "}

                    Shakktii AI

                </div>
            </div>
            {showTerms && (
                <TermsAndConditions
                    onClose={() => setShowTerms(false)}
                />
            )}
            {showPolicy && (
                <Policy
                onClose={()=> setShowPolicy(false)}/>
            )

            }
        </footer>
    );
}