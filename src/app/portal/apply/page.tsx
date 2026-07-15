"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Upload,
  CheckCircle,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Academic Info", icon: FileText },
  { id: 3, title: "Documents", icon: Upload },
  { id: 4, title: "Payment", icon: CreditCard },
  { id: 5, title: "Confirmation", icon: CheckCircle },
];

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    previousSchool: "",
    classAppliedFor: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelationship: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    toast.success("Application submitted successfully! You will receive a confirmation email.");
  };

  return (
    <div className="min-h-screen bg-animated">
      {/* Header */}
      <header className="glass border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold">FFB ERP</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  currentStep >= step.id
                    ? "bg-[var(--primary)]/20 text-[var(--accent)]"
                    : "text-white/30"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= step.id
                      ? "bg-[var(--primary)] text-white"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="hidden md:inline text-sm font-medium">
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`hidden md:block w-12 h-0.5 mx-2 ${
                    currentStep > step.id ? "bg-[var(--primary)]" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
              <p className="text-white/50 mb-8">Provide the student&apos;s personal details</p>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { label: "First Name", field: "firstName", placeholder: "Enter first name" },
                  { label: "Last Name", field: "lastName", placeholder: "Enter last name" },
                  { label: "Middle Name", field: "middleName", placeholder: "Enter middle name (optional)" },
                  { label: "Email", field: "email", type: "email", placeholder: "student@email.com" },
                  { label: "Phone", field: "phone", placeholder: "08012345678" },
                  { label: "Date of Birth", field: "dateOfBirth", type: "date" },
                ].map((input) => (
                  <div key={input.field}>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      {input.label}
                    </label>
                    <input
                      type={input.type || "text"}
                      value={(formData as any)[input.field]}
                      onChange={(e) => handleInputChange(input.field, e.target.value)}
                      placeholder={input.placeholder}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Academic Information</h2>
              <p className="text-white/50 mb-8">Provide academic and guardian details</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Class Applying For
                  </label>
                  <select
                    value={formData.classAppliedFor}
                    onChange={(e) => handleInputChange("classAppliedFor", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="">Select Class</option>
                    <option value="jss1">JSS1</option>
                    <option value="jss2">JSS2</option>
                    <option value="jss3">JSS3</option>
                    <option value="ss1">SS1</option>
                    <option value="ss2">SS2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Previous School
                  </label>
                  <input
                    type="text"
                    value={formData.previousSchool}
                    onChange={(e) => handleInputChange("previousSchool", e.target.value)}
                    placeholder="Enter previous school name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-white font-semibold mb-4 mt-4">Guardian Information</h3>
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => handleInputChange("guardianName", e.target.value)}
                    placeholder="Enter guardian name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Guardian Phone
                  </label>
                  <input
                    type="text"
                    value={formData.guardianPhone}
                    onChange={(e) => handleInputChange("guardianPhone", e.target.value)}
                    placeholder="08012345678"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Document Upload</h2>
              <p className="text-white/50 mb-8">Upload required documents</p>
              <div className="grid md:grid-cols-2 gap-6">
                {["Birth Certificate", "Previous Report Card", "Passport Photograph", "Medical Record"].map(
                  (doc) => (
                    <div
                      key={doc}
                      className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[var(--primary)] transition-colors cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-white/30 mx-auto mb-3" />
                      <p className="text-white/60 text-sm font-medium">{doc}</p>
                      <p className="text-white/30 text-xs mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Application Fee</h2>
              <p className="text-white/50 mb-8">Pay the application fee to complete your application</p>
              <div className="text-center py-10">
                <div className="text-5xl font-bold text-[var(--accent)] mb-2">₦10,000</div>
                <p className="text-white/50 mb-8">Application Processing Fee</p>
                <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--blue-2)] text-white font-bold text-lg hover:opacity-90 transition-all">
                  Pay with Flutterwave
                </button>
                <p className="text-white/30 text-sm mt-4">
                  Secure payment powered by Flutterwave
                </p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
              <p className="text-white/50 mb-4 max-w-md mx-auto">
                Your application has been submitted successfully. You will receive a
                confirmation email with your application number.
              </p>
              <p className="text-[var(--accent)] font-mono text-lg mb-8">
                Application No: APP/2025/006
              </p>
              <Link
                href="/"
                className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-all inline-block"
              >
                Return to Home
              </Link>
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-xl glass border border-white/20 text-white font-medium hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (currentStep === 4) {
                  handleSubmit();
                }
                setCurrentStep((s) => Math.min(5, s + 1));
              }}
              className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-all flex items-center gap-2"
            >
              {currentStep === 4 ? "Submit Application" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
