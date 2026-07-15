"use client";

import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Users,
  RefreshCw,
  Settings,
  CheckCircle,
} from "lucide-react";

const predictions = [
  { title: "Enrollment Forecast", description: "Expected 15% growth in next session", confidence: 87, type: "growth", icon: Users },
  { title: "At-Risk Students", description: "23 students identified as at-risk", confidence: 92, type: "risk", icon: AlertTriangle },
  { title: "Revenue Projection", description: "Projected ₦52M revenue for next quarter", confidence: 78, type: "growth", icon: TrendingUp },
];

const recommendations = [
  { title: "Intervention Program", description: "After-school tutorials for SS1 Physics", priority: "high", impact: "High" },
  { title: "Teacher Training", description: "Workshop for teachers using outdated methods", priority: "medium", impact: "Medium" },
  { title: "Resource Allocation", description: "Optimize library hours based on usage", priority: "low", impact: "Low" },
];

const riskFactors = [
  { factor: "Attendance Rate", score: 85, status: "good" },
  { factor: "Assignment Submission", score: 72, status: "warning" },
  { factor: "Exam Performance", score: 78, status: "good" },
  { factor: "Fee Payment", score: 90, status: "good" },
];

const stats = [
  { label: "AI Predictions", value: "45", icon: Brain, color: "from-blue-500 to-blue-600" },
  { label: "Accuracy Rate", value: "89%", icon: CheckCircle, color: "from-emerald-500 to-emerald-600" },
  { label: "At-Risk Students", value: "23", icon: AlertTriangle, color: "from-orange-500 to-orange-600" },
  { label: "Recommendations", value: "12", icon: Lightbulb, color: "from-purple-500 to-purple-600" },
];

export default function AIPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">AI Insights</h1>
            <p className="text-white/60">
              Predictions, recommendations, and risk engine powered by AI
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Settings className="w-4 h-4" />
              Configure
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Predictions</h3>
          <div className="space-y-3">
            {predictions.map((pred, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <pred.icon className={`w-4 h-4 ${pred.type === "risk" ? "text-orange-400" : "text-emerald-400"}`} />
                  <span className="text-white text-sm font-medium">{pred.title}</span>
                </div>
                <p className="text-white/40 text-xs mb-2">{pred.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs">Confidence: {pred.confidence}%</span>
                  <div className="w-16 bg-white/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${pred.confidence > 85 ? "bg-emerald-500" : "bg-orange-500"}`}
                      style={{ width: `${pred.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">{rec.title}</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    rec.priority === "high" ? "bg-red-500/20 text-red-400" :
                    rec.priority === "medium" ? "bg-orange-500/20 text-orange-400" :
                    "bg-white/10 text-white/40"
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-white/40 text-xs">{rec.description}</p>
                <p className="text-white/30 text-xs mt-2">Impact: {rec.impact}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Risk Engine</h3>
          <div className="space-y-3">
            {riskFactors.map((risk, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">{risk.factor}</span>
                  <span className={`text-sm font-bold ${risk.status === "good" ? "text-emerald-400" : "text-orange-400"}`}>
                    {risk.score}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${risk.status === "good" ? "bg-emerald-500" : "bg-orange-500"}`}
                    style={{ width: `${risk.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-[var(--primary)]/20 border border-[var(--primary)]/30">
            <p className="text-white text-sm font-medium">Overall Risk Score</p>
            <p className="text-2xl font-bold text-[var(--accent)]">81%</p>
            <p className="text-white/40 text-xs">Low risk - Students performing well</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
