"use client";

import { useState } from "react";

import ProfilesTab from "@/components/features/admin/tabs/ProfilesTab";
import TournamentList from "@/components/features/admin/tabs/TournamentList";
import ParticipantList from "@/components/features/admin/tabs/ParticipantList";
import MatchManagement from "@/components/features/admin/tabs/MatchManagement";

import AddTournamentForm from "@/components/features/admin/UI/AddTournamentForm";
import AddMatchForm from "@/components/features/admin/UI/AddMatchForm";
import AddParticipantsForm from "@/components/features/admin/UI/AddParticipantForm";
import AddProfileForm from "@/components/features/admin/UI/AddProfileForm";

import { useStore } from "@/store";

type ActiveTab = "tournaments" | "participants" | "matches" | "profiles";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tournaments");
  const { tournaments, matches } = useStore();

  const tabs: ActiveTab[] = [
    "tournaments",
    "participants",
    "matches",
    "profiles",
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tournament Admin Panel
              </h1>
              <p className="text-sm text-gray-600">
                Manage tournaments, teams, and participants
              </p>
            </div>
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  } whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <span className="text-blue-600">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Tournaments
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tournaments.filter((t) => t.status === "ongoing").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <span className="text-green-600">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-semibold text-gray-900">{1}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3">
                <span className="text-purple-600">👤</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Participants
                </p>
                <p className="text-2xl font-semibold text-gray-900">{1}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3">
                <span className="text-yellow-600">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Matches
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {matches?.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === "tournaments" && (
            <>
              <TournamentList />
              <AddTournamentForm />
            </>
          )}
          {activeTab === "participants" && (
            <>
              <ParticipantList />
              <AddParticipantsForm />
            </>
          )}
          {activeTab === "matches" && (
            <>
              <MatchManagement />
              <AddMatchForm />
            </>
          )}
          {activeTab === "profiles" && (
            <>
              <ProfilesTab />
              <AddProfileForm />
            </>
          )}
        </div>
      </main>

      {/* Forms */}
    </div>
  );
}

export default AdminDashboard;
