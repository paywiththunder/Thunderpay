"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiMagnifyingGlass } from "react-icons/hi2";

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  initial: string;
}

const contacts: Contact[] = [
  {
    id: "1",
    name: "Newton Afobaje Arowolo",
    phoneNumber: "9068233532",
    initial: "N",
  },
  {
    id: "2",
    name: "Ugo Kyoshi Omotola",
    phoneNumber: "9068233532",
    initial: "U",
  },
  {
    id: "3",
    name: "Hakeem Kyoshi Omotola",
    phoneNumber: "9068233532",
    initial: "H",
  },
  {
    id: "4",
    name: "Sarah Okoro",
    phoneNumber: "9087654321",
    initial: "S",
  },
  {
    id: "5",
    name: "Michael Chukwu",
    phoneNumber: "9012345678",
    initial: "M",
  },
];

export default function SearchPeerPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumber.includes(searchQuery)
  );

  const handleContactSelect = (contact: Contact) => {
    router.push(`/receive/peer-to-peer/amount?peer=${contact.id}&name=${encodeURIComponent(contact.name)}&phone=${contact.phoneNumber}`);
  };

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Peer to Peer Request</h1>
      </header>

      <div className="flex flex-col gap-4 px-4 overflow-y-auto pb-6">
        {/* Search Bar */}
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="search"
            className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-12 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          />
        </div>

        {/* Contact List */}
        <div className="flex flex-col gap-3">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleContactSelect(contact)}
              className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">
                  {contact.initial}
                </span>
              </div>
              <div className="flex flex-col flex-grow items-start">
                <span className="text-white font-medium">{contact.name}</span>
                <span className="text-gray-400 text-sm">
                  {contact.phoneNumber} Thunder
                </span>
              </div>
            </button>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <p className="text-gray-400 text-center py-8">No contacts found</p>
        )}
      </div>
    </div>
  );
}

