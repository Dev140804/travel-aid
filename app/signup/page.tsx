"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AnimatedHeroBackground from "@/components/AnimatedHeroBackground";

const COUNTRY_CODES: Record<string, string> = {
  "Afghanistan": "+93", "Albania": "+355", "Algeria": "+213", "Andorra": "+376", "Angola": "+244",
  "Argentina": "+54", "Armenia": "+374", "Australia": "+61", "Austria": "+43", "Azerbaijan": "+994",
  "Bahamas": "+1", "Bahrain": "+973", "Bangladesh": "+880", "Barbados": "+1", "Belarus": "+375",
  "Belgium": "+32", "Belize": "+501", "Benin": "+229", "Bhutan": "+975", "Bolivia": "+591",
  "Bosnia and Herzegovina": "+387", "Botswana": "+267", "Brazil": "+55", "Brunei": "+673", "Bulgaria": "+359",
  "Burkina Faso": "+226", "Burundi": "+257", "Cambodia": "+855", "Cameroon": "+237", "Canada": "+1",
  "Cape Verde": "+238", "Central African Republic": "+236", "Chad": "+235", "Chile": "+56", "China": "+86",
  "Colombia": "+57", "Comoros": "+269", "Congo": "+242", "Costa Rica": "+506", "Croatia": "+385",
  "Cuba": "+53", "Cyprus": "+357", "Czech Republic": "+420", "Czechia": "+420", "Denmark": "+45",
  "Djibouti": "+253", "Dominica": "+1", "Dominican Republic": "+1", "Ecuador": "+593", "Egypt": "+20",
  "El Salvador": "+503", "Equatorial Guinea": "+240", "Eritrea": "+291", "Estonia": "+372", "Ethiopia": "+251",
  "Fiji": "+679", "Finland": "+358", "France": "+33", "Gabon": "+241", "Gambia": "+220",
  "Georgia": "+995", "Germany": "+49", "Ghana": "+233", "Greece": "+30", "Grenada": "+1",
  "Guatemala": "+502", "Guinea": "+224", "Guinea-Bissau": "+245", "Guyana": "+592", "Haiti": "+509",
  "Honduras": "+504", "Hungary": "+36", "Iceland": "+354", "India": "+91", "Indonesia": "+62",
  "Iran": "+98", "Iraq": "+964", "Ireland": "+353", "Israel": "+972", "Italy": "+39",
  "Jamaica": "+1", "Japan": "+81", "Jordan": "+962", "Kazakhstan": "+7", "Kenya": "+254",
  "Kiribati": "+686", "Kosovo": "+383", "Kuwait": "+965", "Kyrgyzstan": "+996", "Laos": "+856",
  "Latvia": "+371", "Lebanon": "+961", "Lesotho": "+266", "Liberia": "+231", "Libya": "+218",
  "Liechtenstein": "+423", "Lithuania": "+370", "Luxembourg": "+352", "Madagascar": "+261", "Malawi": "+265",
  "Malaysia": "+60", "Maldives": "+960", "Mali": "+223", "Malta": "+356", "Marshall Islands": "+692",
  "Mauritania": "+222", "Mauritius": "+230", "Mexico": "+52", "Micronesia": "+691", "Moldova": "+373",
  "Monaco": "+377", "Mongolia": "+976", "Montenegro": "+382", "Morocco": "+212", "Mozambique": "+258",
  "Myanmar": "+95", "Namibia": "+264", "Nauru": "+674", "Nepal": "+977", "Netherlands": "+31",
  "New Zealand": "+64", "Nicaragua": "+505", "Niger": "+227", "Nigeria": "+234", "North Korea": "+850",
  "North Macedonia": "+389", "Norway": "+47", "Oman": "+968", "Pakistan": "+92", "Palau": "+680",
  "Palestine": "+970", "Panama": "+507", "Papua New Guinea": "+675", "Paraguay": "+595", "Peru": "+51",
  "Philippines": "+63", "Poland": "+48", "Portugal": "+351", "Qatar": "+974", "Romania": "+40",
  "Russia": "+7", "Rwanda": "+250", "Saint Kitts and Nevis": "+1", "Saint Lucia": "+1",
  "Saint Vincent and the Grenadines": "+1", "Samoa": "+685", "San Marino": "+378", "Sao Tome and Principe": "+239",
  "Saudi Arabia": "+966", "Senegal": "+221", "Serbia": "+381", "Seychelles": "+248", "Sierra Leone": "+232",
  "Singapore": "+65", "Slovakia": "+421", "Slovenia": "+386", "Solomon Islands": "+677", "Somalia": "+252",
  "South Africa": "+27", "South Korea": "+82", "South Sudan": "+211", "Spain": "+34", "Sri Lanka": "+94",
  "Sudan": "+249", "Suriname": "+597", "Sweden": "+46", "Switzerland": "+41", "Syria": "+963",
  "Taiwan": "+886", "Tajikistan": "+992", "Tanzania": "+255", "Thailand": "+66", "Timor-Leste": "+670",
  "Togo": "+228", "Tonga": "+676", "Trinidad and Tobago": "+1", "Tunisia": "+216", "Turkey": "+90",
  "Turkmenistan": "+993", "Tuvalu": "+688", "Uganda": "+256", "Ukraine": "+380", "United Arab Emirates": "+971",
  "United Kingdom": "+44", "United States": "+1", "Uruguay": "+598", "Uzbekistan": "+998", "Vanuatu": "+678",
  "Vatican City": "+379", "Venezuela": "+58", "Vietnam": "+84", "Yemen": "+967", "Zambia": "+260", "Zimbabwe": "+263"
};

const COUNTRIES = Object.keys(COUNTRY_CODES).sort();

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phoneNumber: "", address: "", country: "", dateOfBirth: "", password: "", confirmPassword: "", agreeToTerms: false,
  });

  const [generatedUsername, setGeneratedUsername] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Password requirement checks
  const passwordRequirements = {
    length: formData.password.length >= 8,
    capital: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    let newValue = value;

    // Phone field: only allow numbers, max 10 digits
    if (name === "phoneNumber") {
      newValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    const newFormData = {
      ...formData,
      [name]: type === "checkbox" ? (target as HTMLInputElement).checked : newValue,
    };
    
    // When country changes, clear phone field
    if (name === "country") {
      newFormData.phoneNumber = "";
    }
    
    setFormData(newFormData);
    if ((name === "lastName" || name === "phoneNumber") && newFormData.lastName && newFormData.phoneNumber) {
      const last3Digits = newFormData.phoneNumber.slice(-3);
      setGeneratedUsername(`${newFormData.lastName.toLowerCase()}${last3Digits}`);
    }

    // Real-time validation - remove error when field becomes valid
    const newErrors = { ...errors };
    
    if (name === "firstName") {
      if (newValue.trim()) delete newErrors.firstName;
    } else if (name === "lastName") {
      if (newValue.trim()) delete newErrors.lastName;
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(newValue)) delete newErrors.email;
    } else if (name === "country") {
      if (newValue) delete newErrors.country;
    } else if (name === "phoneNumber") {
      if (newValue.length === 10) delete newErrors.phoneNumber;
    } else if (name === "address") {
      if (newValue.trim().length >= 10) delete newErrors.address;
    } else if (name === "password") {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (passwordRegex.test(newValue)) delete newErrors.password;
    } else if (name === "confirmPassword") {
      if (newValue === formData.password) delete newErrors.confirmPassword;
    } else if (name === "agreeToTerms") {
      if (newValue) delete newErrors.agreeToTerms;
    }
    
    setErrors(newErrors);
  };

  const handleDateOfBirthChange = (newDOB: string) => {
    setFormData({...formData, dateOfBirth: newDOB});
    
    // Real-time validation for DOB
    const newErrors = { ...errors };
    const dobParts = newDOB.split("-");
    
    if (newDOB && dobParts.length === 3 && dobParts[0] && dobParts[1] && dobParts[2]) {
      try {
        const dobDate = new Date(newDOB);
        const age = new Date().getFullYear() - dobDate.getFullYear();
        if (age >= 13) {
          delete newErrors.dateOfBirth;
        }
      } catch {
        // Invalid date
      }
    }
    
    setErrors(newErrors);
  };



  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Required";
    if (!formData.lastName.trim()) newErrors.lastName = "Required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) newErrors.email = "Valid email required";
    
    // Phone validation
    if (!formData.country) {
      newErrors.country = "Required";
      if (formData.phoneNumber && formData.phoneNumber !== "") {
        newErrors.phoneNumber = "Select country first";
      }
    } else {
      // Country is selected, validate phone is exactly 10 digits
      if (!formData.phoneNumber || formData.phoneNumber === "") {
        newErrors.phoneNumber = "Phone required";
      } else if (formData.phoneNumber.length !== 10) {
        newErrors.phoneNumber = "Must be exactly 10 digits";
      }
    }
    
    if (!formData.address.trim() || formData.address.trim().length < 10) newErrors.address = "Min 10 characters";
    
    // DOB validation - check all three parts are selected
    const dobParts = formData.dateOfBirth.split("-");
    if (!formData.dateOfBirth || formData.dateOfBirth === "" || dobParts.length !== 3 || !dobParts[0] || !dobParts[1] || !dobParts[2]) {
      newErrors.dateOfBirth = "Required";
    } else {
      try {
        const dobDate = new Date(formData.dateOfBirth);
        const age = new Date().getFullYear() - dobDate.getFullYear();
        if (age < 13) newErrors.dateOfBirth = "Must be 13+";
      } catch {
        newErrors.dateOfBirth = "Invalid date";
      }
    }
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(formData.password)) newErrors.password = "8+ chars, 1 capital, 1 number, 1 special";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Don't match";
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, username: generatedUsername }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed");
      }
      setSuccess(true);
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1F3A] text-[#F8F9FB] relative overflow-hidden">
      <style>{`
        select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }
        select option {
          background-color: #0B1F3A;
          color: #F8F9FB;
        }
        select option:checked {
          background: linear-gradient(#D4AF37, #D4AF37);
          background-color: #D4AF37;
          color: #0B1F3A;
        }
      `}</style>
      <AnimatedHeroBackground />
      <div className="relative z-20 flex flex-col min-h-screen">
        <header className="flex h-20 items-center justify-between border-b border-[#D4AF37]/20 px-6 lg:px-12 backdrop-blur-md bg-[#0B1F3A]/60">
          <Link href="/" className="flex items-center gap-3 cursor-pointer"><Image src="/erasebg-transformed.png" alt="Logo" width={60} height={60} /><div className="font-serif"><span className="text-[#F8F9FB]">Trip</span><span className="text-[#D4AF37]"> Planner</span></div></Link>
          <Link href="/login" className="text-sm text-gray-300 hover:text-[#D4AF37] cursor-pointer">Have an account? <span className="text-[#D4AF37]">Log in</span></Link>
        </header>

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-2xl">
            <div className="mb-8 text-center"><h1 className="text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C547]">Join Trip Planner</h1><p className="text-gray-300">Create your account to plan amazing trips</p></div>

            {success && <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-center">✅ Success! Redirecting...</div>}

            <form onSubmit={handleSubmit} onClick={(e) => {if (!(e.target as HTMLElement).closest(".country-dropdown")) setShowCountryDropdown(false);}} className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div><label className="block text-sm font-semibold text-[#D4AF37] mb-2">First Name *</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Name" className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] placeholder:text-gray-500 ${errors.firstName ? "border-red-500" : "border-[#D4AF37]/30"}`} />{errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}</div>
                <div><label className="block text-sm font-semibold text-[#D4AF37] mb-2">Last Name *</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Surname" className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] placeholder:text-gray-500 ${errors.lastName ? "border-red-500" : "border-[#D4AF37]/30"}`} />{errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}</div>
              </div>

              {generatedUsername && <div className="mb-6 p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/50 rounded-lg"><p className="text-xs text-gray-400">Username (Auto)</p><p className="text-lg font-bold text-[#D4AF37]">{generatedUsername}</p></div>}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div><label className="block text-sm font-semibold text-[#D4AF37] mb-2">Email *</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] placeholder:text-gray-500 ${errors.email ? "border-red-500" : "border-[#D4AF37]/30"}`} />{errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}</div>
                <div className="country-dropdown"><label className="block text-sm font-semibold text-[#D4AF37] mb-2">Country *</label><div className="relative"><input type="text" value={formData.country} onChange={() => setShowCountryDropdown(!showCountryDropdown)} onFocus={() => setShowCountryDropdown(true)} placeholder="Select Country" readOnly className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] placeholder:text-gray-500 cursor-pointer ${errors.country ? "border-red-500" : "border-[#D4AF37]/30"}`} />{showCountryDropdown && <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B1F3A] border border-[#D4AF37]/30 rounded-lg max-h-48 overflow-y-auto z-50">{COUNTRIES.map((c) => <div key={c} onClick={() => {setFormData({...formData, country: c}); setShowCountryDropdown(false);}} className="px-4 py-2 hover:bg-[#D4AF37]/20 cursor-pointer text-[#F8F9FB] border-b border-[#D4AF37]/10 flex items-center gap-2"><span className="text-[#D4AF37] font-semibold min-w-fit">{COUNTRY_CODES[c]}</span><span className="text-[#F8F9FB]">{c}</span></div>)}</div>}</div>{errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}</div>
              </div>

              <div className="mb-6"><label className="block text-sm font-semibold text-[#D4AF37] mb-2">Phone (10 digits) *</label><input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder={formData.country ? "Enter 10-digit phone number" : "Select country first"} disabled={!formData.country} maxLength={10} className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.phoneNumber ? "border-red-500" : "border-[#D4AF37]/30"}`} />{errors.phoneNumber && <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>}</div>

              <div className="mb-6"><label className="block text-sm font-semibold text-[#D4AF37] mb-2">Address (min 10 chars) *</label><textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" rows={3} className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] placeholder:text-gray-500 resize-none ${errors.address ? "border-red-500" : "border-[#D4AF37]/30"}`} />{errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}</div>

              <div className="mb-6"><label className="block text-sm font-semibold text-[#D4AF37] mb-2">Date of Birth *</label><div className="grid grid-cols-3 gap-4"><div><select value={formData.dateOfBirth.split("-")[2] || ""} onChange={(e) => {const parts = formData.dateOfBirth.split("-"); parts[2] = e.target.value; handleDateOfBirthChange(parts.join("-").replace(/^--/, ""));}} className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] ${errors.dateOfBirth ? "border-red-500" : "border-[#D4AF37]/30"}`}><option value="">Date</option>{Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={String(d).padStart(2, "0")}>{d}</option>)}</select></div><div><select value={formData.dateOfBirth.split("-")[1] || ""} onChange={(e) => {const parts = formData.dateOfBirth.split("-"); parts[1] = e.target.value; handleDateOfBirthChange(parts.join("-").replace(/^--/, ""));}} className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] ${errors.dateOfBirth ? "border-red-500" : "border-[#D4AF37]/30"}`}><option value="">Month</option>{["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>)}</select></div><div><select value={formData.dateOfBirth.split("-")[0] || ""} onChange={(e) => {const parts = formData.dateOfBirth.split("-"); parts[0] = e.target.value; handleDateOfBirthChange(parts.join("-").replace(/^--/, ""));}} className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] ${errors.dateOfBirth ? "border-red-500" : "border-[#D4AF37]/30"}`}><option value="">Year</option>{Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}</select></div></div>{errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>}</div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div><label className="block text-sm font-semibold text-[#D4AF37] mb-2">Password *</label><input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] placeholder:text-gray-500 ${errors.password ? "border-red-500" : "border-[#D4AF37]/30"}`} />{errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}</div>
                <div><label className="block text-sm font-semibold text-[#D4AF37] mb-2">Confirm Password *</label><input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm" className={`w-full px-4 py-3 bg-[#0B1F3A]/50 border rounded-lg text-[#F8F9FB] placeholder:text-gray-500 ${errors.confirmPassword ? "border-red-500" : "border-[#D4AF37]/30"}`} />{errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}</div>
              </div>

              <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"><p className="text-xs text-blue-300 mb-3">Password Requirements:</p><ul className="text-xs space-y-2"><li className={`${passwordRequirements.length ? "text-[#D4AF37]" : "text-gray-500"}`}>✓ At least 8 characters</li><li className={`${passwordRequirements.capital ? "text-[#D4AF37]" : "text-gray-500"}`}>✓ At least 1 capital letter</li><li className={`${passwordRequirements.number ? "text-[#D4AF37]" : "text-gray-500"}`}>✓ At least 1 number</li><li className={`${passwordRequirements.special ? "text-[#D4AF37]" : "text-gray-500"}`}>✓ At least 1 special character (!@#$%^&*)</li></ul></div>

              <div className="mb-6 flex items-start gap-3"><input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} className="mt-1 w-5 h-5" /><label className="text-sm text-gray-300">I agree to <span className="text-[#D4AF37] font-semibold">Terms</span> and <span className="text-[#D4AF37] font-semibold">Privacy</span> *</label></div>
              {errors.agreeToTerms && <p className="text-red-400 text-sm mb-6">{errors.agreeToTerms}</p>}
              {errors.submit && <p className="text-red-400 text-sm mb-6 text-center">{errors.submit}</p>}

              <button type="submit" disabled={isSubmitting} className="w-full px-6 py-3 text-lg font-bold rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A] hover:shadow-2xl disabled:opacity-50 cursor-pointer">{isSubmitting ? "Creating..." : "Create Account"}</button>
              <p className="text-center text-gray-400 text-sm mt-4">Have an account? <Link href="/login" className="text-[#D4AF37] font-semibold hover:underline cursor-pointer">Log in</Link></p>
            </form>
          </div>
        </main>

        <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-400 backdrop-blur-md bg-[#0B1F3A]/40"><p>© {new Date().getFullYear()} Trip Planner. All rights reserved.</p></footer>
      </div>
    </div>
  );
}
