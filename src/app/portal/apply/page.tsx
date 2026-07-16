"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

const steps = ["Personal Info", "Academic Info", "Guardian Info", "Documents", "Review"];

const classOptions = [
  { section: "Crèche & Nursery", classes: ["Crèche", "Nursery 1", "Nursery 2", "Nursery 3"] },
  { section: "Primary", classes: ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6"] },
  { section: "Junior Secondary", classes: ["JSS 1", "JSS 2", "JSS 3"] },
  { section: "Senior Secondary", classes: ["SSS 1", "SSS 2", "SSS 3"] },
];

export default function ApplyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appNumber, setAppNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    firstName: "", lastName: "", middleName: "", dateOfBirth: "", gender: "", bloodGroup: "", nationality: "Nigerian", stateOfOrigin: "", homeAddress: "",
    previousSchool: "", classApplying: "",
    guardianName: "", guardianPhone: "", guardianEmail: "", guardianRelationship: "",
    birthCert: "", reportCard: "", medicalCert: "",
  });

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = "Required";
      if (!form.lastName.trim()) e.lastName = "Required";
      if (!form.dateOfBirth) e.dateOfBirth = "Required";
      if (!form.gender) e.gender = "Required";
    }
    if (step === 1) {
      if (!form.classApplying) e.classApplying = "Required";
    }
    if (step === 2) {
      if (!form.guardianName.trim()) e.guardianName = "Required";
      if (!form.guardianPhone.trim()) e.guardianPhone = "Required";
      if (!form.guardianRelationship) e.guardianRelationship = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validate()) setStep(step + 1); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName, lastName: form.lastName, middleName: form.middleName,
          email: "", phone: "", dateOfBirth: form.dateOfBirth, gender: form.gender,
          classAppliedFor: form.classApplying, previousSchool: form.previousSchool,
          schoolId: "school_ffb",
          guardianName: form.guardianName, guardianPhone: form.guardianPhone,
          guardianEmail: form.guardianEmail, guardianRelationship: form.guardianRelationship,
          address: form.homeAddress, nationality: form.nationality,
          stateOfOrigin: form.stateOfOrigin, bloodGroup: form.bloodGroup,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppNumber(data.applicationNumber);
        setSubmitted(true);
      }
    } catch { }
    setSubmitting(false);
  };

  const inputStyle: React.CSSProperties = { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "16px", padding: "14px 18px", color: "#fff", fontSize: "14px", outline: "none", width: "100%", fontFamily: "'Poppins', sans-serif" };
  const inputErrorStyle: React.CSSProperties = { ...inputStyle, borderColor: "rgba(239,68,68,0.6)" };
  const labelStyle: React.CSSProperties = { fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px", display: "block", fontWeight: 600 };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative" }}>
        {particles.map((p) => (
          <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }} />
        ))}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} style={{ textAlign: "center", maxWidth: "500px" }}>
          <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "linear-gradient(135deg, #28ff9c, #0055ff)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 25px", fontSize: "42px" }}>✓</div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>Application Submitted!</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "20px", lineHeight: 1.7 }}>Your admission application has been received successfully.</p>
          <div style={{ background: "rgba(40,255,156,0.08)", border: "1px solid rgba(40,255,156,0.2)", borderRadius: "16px", padding: "18px", marginBottom: "25px" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "5px" }}>APPLICATION NUMBER</p>
            <p style={{ fontSize: "22px", fontWeight: 800, color: "#28ff9c", letterSpacing: "1px" }}>{appNumber}</p>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "25px" }}>
            Use this number to track your admission status.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/portal/track" className="btn-primary" style={{ display: "inline-block" }}>Track Application</Link>
            <Link href="/" className="btn-primary" style={{ display: "inline-block", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}>Return Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }} />
      ))}

      <div className="navbar">
        <div className="nav-inner">
          <Link href="/" className="flex items-center gap-2"><img src="/logo.svg" alt="FFB" style={{ height: "50px" }} /></Link>
          <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <Link href="/">Home</Link>
            <Link href="/portal/apply" className="menu-btn apply-btn" style={{ color: "#001f5f" }}>Admissions</Link>
            <Link href="/auth/login" className="menu-btn portal-btn">Portal</Link>
          </div>
          <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <section style={{ marginTop: "80px", padding: "40px 20px 20px", textAlign: "center" }}>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800 }}>
          Admission <span className="accent">Application</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ color: "rgba(255,255,255,0.6)", maxWidth: "500px", margin: "10px auto 0" }}>
          Complete the form below to apply for admission.
        </motion.p>
      </section>

      <section className="glass-section" style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Progress */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", position: "relative" }}>
          <div style={{ position: "absolute", top: "15px", left: "0", right: "0", height: "2px", background: "rgba(255,255,255,0.1)" }}></div>
          <div style={{ position: "absolute", top: "15px", left: "0", height: "2px", background: "#28ff9c", width: `${(step / (steps.length - 1)) * 100}%`, transition: "0.5s" }}></div>
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: "center", position: "relative", zIndex: 1, flex: 1 }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: i <= step ? "#28ff9c" : "rgba(255,255,255,0.1)", color: i <= step ? "#001f5f" : "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: "13px", fontWeight: 700, transition: "0.3s" }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "11px", color: i <= step ? "#28ff9c" : "rgba(255,255,255,0.3)", fontWeight: 600 }}>{s}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            {step === 0 && (
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Personal Information</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div><label style={labelStyle}>First Name *</label><input style={errors.firstName ? inputErrorStyle : inputStyle} value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />{errors.firstName && <span style={{ color: "#ef4444", fontSize: "11px" }}>{errors.firstName}</span>}</div>
                  <div><label style={labelStyle}>Last Name *</label><input style={errors.lastName ? inputErrorStyle : inputStyle} value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />{errors.lastName && <span style={{ color: "#ef4444", fontSize: "11px" }}>{errors.lastName}</span>}</div>
                  <div><label style={labelStyle}>Middle Name</label><input style={inputStyle} value={form.middleName} onChange={(e) => update("middleName", e.target.value)} /></div>
                  <div><label style={labelStyle}>Date of Birth *</label><input style={errors.dateOfBirth ? inputErrorStyle : inputStyle} type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} />{errors.dateOfBirth && <span style={{ color: "#ef4444", fontSize: "11px" }}>{errors.dateOfBirth}</span>}</div>
                  <div><label style={labelStyle}>Gender *</label><select style={errors.gender ? inputErrorStyle : inputStyle} value={form.gender} onChange={(e) => update("gender", e.target.value)}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select>{errors.gender && <span style={{ color: "#ef4444", fontSize: "11px" }}>{errors.gender}</span>}</div>
                  <div><label style={labelStyle}>Blood Group</label><select style={inputStyle} value={form.bloodGroup} onChange={(e) => update("bloodGroup", e.target.value)}><option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select></div>
                  <div><label style={labelStyle}>Nationality</label><input style={inputStyle} value={form.nationality} onChange={(e) => update("nationality", e.target.value)} /></div>
                  <div><label style={labelStyle}>State of Origin</label><input style={inputStyle} value={form.stateOfOrigin} onChange={(e) => update("stateOfOrigin", e.target.value)} /></div>
                </div>
                <div style={{ marginTop: "14px" }}><label style={labelStyle}>Home Address</label><textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.homeAddress} onChange={(e) => update("homeAddress", e.target.value)} /></div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Academic Information</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Class Applying For *</label><select style={errors.classApplying ? inputErrorStyle : inputStyle} value={form.classApplying} onChange={(e) => update("classApplying", e.target.value)}><option value="">Select a class</option>{classOptions.map((section) => (<optgroup key={section.section} label={section.section}>{section.classes.map((c) => (<option key={c} value={c}>{c}</option>))}</optgroup>))}</select>{errors.classApplying && <span style={{ color: "#ef4444", fontSize: "11px" }}>{errors.classApplying}</span>}</div>
                  <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Previous School</label><input style={inputStyle} value={form.previousSchool} onChange={(e) => update("previousSchool", e.target.value)} placeholder="Enter previous school name" /></div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Parent / Guardian Information</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div><label style={labelStyle}>Full Name *</label><input style={errors.guardianName ? inputErrorStyle : inputStyle} value={form.guardianName} onChange={(e) => update("guardianName", e.target.value)} />{errors.guardianName && <span style={{ color: "#ef4444", fontSize: "11px" }}>{errors.guardianName}</span>}</div>
                  <div><label style={labelStyle}>Relationship *</label><select style={errors.guardianRelationship ? inputErrorStyle : inputStyle} value={form.guardianRelationship} onChange={(e) => update("guardianRelationship", e.target.value)}><option value="">Select</option><option>Father</option><option>Mother</option><option>Guardian</option><option>Uncle</option><option>Aunt</option><option>Other</option></select>{errors.guardianRelationship && <span style={{ color: "#ef4444", fontSize: "11px" }}>{errors.guardianRelationship}</span>}</div>
                  <div><label style={labelStyle}>Phone *</label><input style={errors.guardianPhone ? inputErrorStyle : inputStyle} value={form.guardianPhone} onChange={(e) => update("guardianPhone", e.target.value)} placeholder="+234..." />{errors.guardianPhone && <span style={{ color: "#ef4444", fontSize: "11px" }}>{errors.guardianPhone}</span>}</div>
                  <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={form.guardianEmail} onChange={(e) => update("guardianEmail", e.target.value)} /></div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Documents</h2>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginBottom: "20px" }}>Upload required documents (PDF, JPG or PNG, max 5MB each)</p>
                {[
                  { key: "birthCert", label: "Birth Certificate" },
                  { key: "reportCard", label: "Last School Report Card" },
                  { key: "medicalCert", label: "Medical Certificate" },
                ].map((doc) => (
                  <div key={doc.key} style={{ marginBottom: "16px", padding: "20px", border: "2px dashed rgba(255,255,255,0.15)", borderRadius: "16px", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>📄</div>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>{doc.label}</p>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} id={doc.key} onChange={(e) => update(doc.key, e.target.files?.[0]?.name || "")} />
                    <label htmlFor={doc.key} className="btn-primary" style={{ fontSize: "12px", padding: "8px 20px", cursor: "pointer" }}>Choose File</label>
                    {form[doc.key as keyof typeof form] && <p style={{ fontSize: "12px", color: "#28ff9c", marginTop: "8px" }}>✓ {form[doc.key as keyof typeof form]}</p>}
                  </div>
                ))}
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Review Application</h2>
                {[
                  { label: "Name", value: `${form.firstName} ${form.middleName} ${form.lastName}` },
                  { label: "Date of Birth", value: form.dateOfBirth },
                  { label: "Gender", value: form.gender },
                  { label: "Class Applying", value: form.classApplying },
                  { label: "Guardian Name", value: form.guardianName },
                  { label: "Guardian Phone", value: form.guardianPhone },
                  { label: "Guardian Relationship", value: form.guardianRelationship },
                  { label: "Address", value: form.homeAddress },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{r.label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{r.value || "—"}</span>
                  </div>
                ))}
                <div style={{ marginTop: "20px", padding: "14px", background: "rgba(40,255,156,0.06)", border: "1px solid rgba(40,255,156,0.2)", borderRadius: "12px", fontSize: "13px", color: "#28ff9c" }}>
                  By submitting, you confirm all information provided is accurate. False information may result in disqualification.
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{ padding: "12px 28px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: step === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)", cursor: step === 0 ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: 600 }}>
            Previous
          </button>
          {step < steps.length - 1 ? (
            <motion.button onClick={nextStep} className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ padding: "12px 35px" }}>
              Next Step
            </motion.button>
          ) : (
            <motion.button onClick={handleSubmit} className="btn-primary" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ padding: "12px 35px", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Submitting..." : "Submit Application"}
            </motion.button>
          )}
        </div>
      </section>

      <footer className="footer" style={{ marginTop: "40px" }}>
        <div className="footer-bottom">© 2025 FFB Group of Schools. All rights reserved.</div>
      </footer>
    </>
  );
}
