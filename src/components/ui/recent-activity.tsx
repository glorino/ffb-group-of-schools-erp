"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  CreditCard,
  BookOpen,
  Building,
  Bus,
  AlertTriangle,
  CheckCircle,
  Bell,
} from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "admission" | "payment" | "academic" | "hostel" | "transport" | "alert";
}

const iconMap = {
  admission: UserPlus,
  payment: CreditCard,
  academic: BookOpen,
  hostel: Building,
  transport: Bus,
  alert: AlertTriangle,
};

const colorMap = {
  admission: "text-blue-400 bg-blue-500/20",
  payment: "text-emerald-400 bg-emerald-500/20",
  academic: "text-purple-400 bg-purple-500/20",
  hostel: "text-orange-400 bg-orange-500/20",
  transport: "text-cyan-400 bg-cyan-500/20",
  alert: "text-red-400 bg-red-500/20",
};

const sampleActivities: Activity[] = [
  { id: "1", title: "New admission application", description: "Chidi Okonkwo applied for JSS1", time: "5 min ago", type: "admission" },
  { id: "2", title: "Fee payment confirmed", description: "Amina Mohammed paid ₦125,000", time: "12 min ago", type: "payment" },
  { id: "3", title: "Exam results uploaded", description: "SS3 Mathematics results published", time: "1 hour ago", type: "academic" },
  { id: "4", title: "Hostel allocation updated", description: "Block A, Room 12 - 3 new students", time: "2 hours ago", type: "hostel" },
  { id: "5", title: "Transport route optimized", description: "Route 3 (Mainland) time updated", time: "3 hours ago", type: "transport" },
  { id: "6", title: "Low attendance alert", description: "SS2B attendance dropped below 70%", time: "4 hours ago", type: "alert" },
];

interface RecentActivityProps {
  activities?: Activity[];
  showViewAll?: boolean;
}

export function RecentActivity({
  activities = sampleActivities,
  showViewAll = true,
}: RecentActivityProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity, i) => {
        const Icon = iconMap[activity.type];
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[activity.type]}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{activity.title}</p>
              <p className="text-white/40 text-xs">{activity.description}</p>
            </div>
            <span className="text-white/30 text-xs whitespace-nowrap">
              {activity.time}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
