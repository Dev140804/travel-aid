"use client";

import { useMemo } from "react";
import { VEHICLE_DATA } from "../constants/vehicleConstants";
import { IconTag, IconWrench, IconSettings, IconCalendar, IconTool, IconCar, IconMotorcycle, IconFuel, IconGauge } from "./Icons";
import { FaCalendar, FaTag, FaWrench, FaMotorcycle, FaCar } from "react-icons/fa6";
import { FaCog as FaCogV5, FaGasPump as FaGasPumpV5, FaTachometerAlt as FaTachometerAltV5, FaRoad as FaRoadV5 } from 'react-icons/fa';

type Props = {
  vehicleType: string;
  setVehicleType: (v: string) => void;
  brand: string;
  setBrand: (b: string) => void;
  model: string;
  setModel: (m: string) => void;
  variant: string;
  setVariant: (v: string) => void;
  year: string;
  setYear: (y: string) => void;
  fuel: string;
  setFuel: (f: string) => void;
  lastServiceDate: string;
  setLastServiceDate: (d: string) => void;
  odometer: string;
  setOdometer: (o: string) => void;
  drivingExperience: string;
  setDrivingExperience: (s: string) => void;
  licenseType: string;
  setLicenseType: (l: string) => void;
  comfortableWithLongDrives: string | null;
  setComfortableWithLongDrives: (b: string | null) => void;
  numberOfDrivers: number;
  setNumberOfDrivers: (n: number) => void;
  fieldErrors: Record<string, string>;
  clearFieldError: (field: string) => void;
  showHillDrive?: boolean;
};

export default function VehicleForm(props: Props) {
  const {
    vehicleType,
    setVehicleType,
    brand,
    setBrand,
    model,
    setModel,
    variant,
    setVariant,
    year,
    setYear,
    fuel,
    setFuel,
    lastServiceDate,
    setLastServiceDate,
    odometer,
    setOdometer,
    drivingExperience,
    setDrivingExperience,
    licenseType,
    setLicenseType,
    comfortableWithLongDrives,
    setComfortableWithLongDrives,
    numberOfDrivers,
    setNumberOfDrivers,
    clearFieldError,
      showHillDrive = true,
  } = props;

  const brands = useMemo(() => {
    return vehicleType === "two-wheeler" ? Object.keys(VEHICLE_DATA.twoWheeler) : Object.keys(VEHICLE_DATA.fourWheeler);
  }, [vehicleType]);

  const models = useMemo(() => {
    if (!brand) return [];
    const bucket = vehicleType === "two-wheeler" ? VEHICLE_DATA.twoWheeler : VEHICLE_DATA.fourWheeler;
    return brand && bucket[brand] ? Object.keys(bucket[brand]) : [];
  }, [brand, vehicleType]);

  const fuelOptions = useMemo(() => {
    if (!brand || !model) return [];
    const bucket = vehicleType === "two-wheeler" ? VEHICLE_DATA.twoWheeler : VEHICLE_DATA.fourWheeler;
    return (bucket[brand] && bucket[brand][model]) || [];
  }, [brand, model, vehicleType]);

  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
          {vehicleType === "two-wheeler" ? <FaMotorcycle className="w-5 h-5 text-[#D4AF37] inline-block" /> : <FaCar className="w-5 h-5 text-[#D4AF37] inline-block" />}
          Vehicle Type
          <span className="text-red-400 ml-2">*</span>
        </label>
        <div className="flex gap-3 mt-3" data-invalid={!!props.fieldErrors.vehicleType}>
          {[
            { key: "two-wheeler", label: "Two-Wheeler" },
            { key: "four-wheeler", label: "Four-Wheeler" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setVehicleType(t.key); clearFieldError('vehicleType'); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${vehicleType === t.key ? "bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A] shadow-lg" : "bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
          <FaTag className="w-5 h-5 text-[#D4AF37] inline-block" />
          Brand
          <span className="text-red-400 ml-2">*</span>
        </label>
        <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); props.clearFieldError("brand"); }} className={`w-full mt-2 p-4 rounded-xl bg-white/10 border ${props.fieldErrors.brand ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 appearance-none cursor-pointer`} data-invalid={!!props.fieldErrors.brand}>
          <option value="" className="bg-slate-800">Select brand</option>
          {brands.map((b: string) => (
            <option key={b} value={b} className="bg-slate-800">
              {b}
            </option>
          ))}
        </select>
        {props.fieldErrors.brand && <p className="text-red-400 text-sm mt-1">{props.fieldErrors.brand}</p>}
      </div>

      <div>
        <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
          <FaWrench className="w-5 h-5 text-[#D4AF37] inline-block" />
          Model
          <span className="text-red-400 ml-2">*</span>
        </label>
        <select value={model} onChange={(e) => { setModel(e.target.value); props.clearFieldError("model"); }} className={`w-full mt-2 p-4 rounded-xl bg-white/10 border ${props.fieldErrors.model ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 appearance-none cursor-pointer`} disabled={!models.length} data-invalid={!!props.fieldErrors.model}>
          <option value="" className="bg-slate-800">Select model</option>
          {models.length ? models.map((m: string) => (
            <option key={m} value={m} className="bg-slate-800">
              {m}
            </option>
          )) : <option className="bg-slate-800">Select brand first</option>}
        </select>
        {props.fieldErrors.model && <p className="text-red-400 text-sm mt-1">{props.fieldErrors.model}</p>}
      </div>

      <div>
        <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
          <FaCogV5 className="w-5 h-5 text-[#D4AF37] inline-block" />
          Variant (optional)
        </label>
        <input value={variant} onChange={(e) => setVariant(e.target.value)} placeholder="e.g., XZ+, S, LX" className="w-full mt-2 p-4 rounded-xl bg-white/10 border border-white/20 text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
            <FaCalendar className="w-5 h-5 text-[#D4AF37] inline-block" />
            Manufacturing Year
            <span className="text-red-400 ml-2">*</span>
          </label>
          <input value={year} onChange={(e) => setYear(e.target.value)} className={`w-full mt-2 p-4 rounded-xl bg-white/10 border ${props.fieldErrors.year ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15`} data-invalid={!!props.fieldErrors.year} />
          {props.fieldErrors.year && <p className="text-red-400 text-sm mt-1">{props.fieldErrors.year}</p>}
        </div>
        <div>
          <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
            <FaGasPumpV5 className="w-5 h-5 text-[#D4AF37] inline-block" />
            Fuel / Power
            <span className="text-red-400 ml-2">*</span>
          </label>
          <select value={fuel} onChange={(e) => { setFuel(e.target.value); props.clearFieldError("fuel"); }} className={`w-full mt-2 p-4 rounded-xl bg-white/10 border ${props.fieldErrors.fuel ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 appearance-none cursor-pointer`} disabled={!fuelOptions.length} data-invalid={!!props.fieldErrors.fuel}>
            <option value="">Select fuel/power</option>
            {fuelOptions.map((f: string) => (
              <option key={f} value={f} className="bg-slate-800">
                {f}
              </option>
            ))}
          </select>
          {props.fieldErrors.fuel && <p className="text-red-400 text-sm mt-1">{props.fieldErrors.fuel}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
            <FaWrench className="w-5 h-5 text-[#D4AF37] inline-block" />
              Last Service Date
              <span className="text-red-400 ml-2">*</span>
          </label>
          <input type="date" value={lastServiceDate} onChange={(e) => { setLastServiceDate(e.target.value); props.clearFieldError('lastServiceDate'); }} className={`w-full mt-2 p-4 rounded-xl bg-white/10 border ${props.fieldErrors.lastServiceDate ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15`} data-invalid={!!props.fieldErrors.lastServiceDate} />
          {props.fieldErrors.lastServiceDate && <p className="text-red-400 text-sm mt-1">{props.fieldErrors.lastServiceDate}</p>}
        </div>
        <div>
          <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
            <FaTachometerAltV5 className="w-5 h-5 text-[#D4AF37] inline-block" />
            Odometer (km)
            <span className="text-red-400 ml-2">*</span>
          </label>
          <input type="number" min={0} max={500000} value={odometer} onChange={(e) => { const raw = e.target.value; if (raw === '') { setOdometer(''); } else { const n = Math.max(0, Math.min(500000, Number(raw))); setOdometer(String(n)); } props.clearFieldError('odometer'); }} className={`w-full mt-2 p-4 rounded-xl bg-white/10 border ${props.fieldErrors.odometer ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15`} data-invalid={!!props.fieldErrors.odometer} />
            {props.fieldErrors.odometer && <p className="text-red-400 text-sm mt-1">{props.fieldErrors.odometer}</p>}
          </div>
      </div>

      <h4 className="text-xl font-bold text-gray-200 uppercase tracking-wide">Driver Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">
              <FaCalendar className="w-5 h-5 text-[#D4AF37] inline-block" />
              Driving Experience (years)
              <span className="text-red-400 ml-2">*</span>
            </label>
              <input type="number" min={0} max={60} value={drivingExperience} onChange={(e) => { const raw = e.target.value; if (raw === '') { setDrivingExperience(''); } else { const n = Math.max(0, Math.min(60, Number(raw))); setDrivingExperience(String(n)); } props.clearFieldError('drivingExperience'); }} className={`w-full mt-2 p-4 rounded-xl bg-white/10 border ${props.fieldErrors.drivingExperience ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15`} data-invalid={!!props.fieldErrors.drivingExperience} />
              {props.fieldErrors.drivingExperience && <p className="text-red-400 text-sm mt-1">{props.fieldErrors.drivingExperience}</p>}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">
                <FaTag className="w-5 h-5 text-[#D4AF37] inline-block" />
                License Type
                <span className="text-red-400 ml-2">*</span>
              </label>
            <select value={licenseType} onChange={(e) => { setLicenseType(e.target.value); props.clearFieldError('licenseType'); }} className={`w-full mt-2 p-4 rounded-xl bg-white/10 border ${props.fieldErrors.licenseType ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 appearance-none cursor-pointer`} data-invalid={!!props.fieldErrors.licenseType}>
              <option value="">Select license type</option>
              {vehicleType === 'two-wheeler' && <option value="Two-Wheeler License (Gearless)">Two-Wheeler License (Gearless)</option>}
              {vehicleType === 'two-wheeler' && <option value="Two-Wheeler License (Geared)">Two-Wheeler License (Geared)</option>}
              {vehicleType === 'four-wheeler' && <option value="Four-Wheeler License (Manual)">Four-Wheeler License (Manual)</option>}
              {vehicleType === 'four-wheeler' && <option value="Four-Wheeler License (Automatic)">Four-Wheeler License (Automatic)</option>}
              <option value="Both Two-Wheeler & Four-Wheeler License">Both Two-Wheeler & Four-Wheeler License</option>
            </select>
            {props.fieldErrors.licenseType && <p className="text-red-400 text-sm mt-1">{props.fieldErrors.licenseType}</p>}
          </div>
        </div>

        {showHillDrive && (
          <div className="flex items-center gap-4 mt-4" data-invalid={!!props.fieldErrors.comfortableWithLongDrives}>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">
              <FaRoadV5 className="w-5 h-5 text-[#D4AF37] inline-block" />
              Comfortable with long/hill drives?
              <span className="text-red-400 ml-2">*</span>
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setComfortableWithLongDrives('yes'); props.clearFieldError('comfortableWithLongDrives'); }} className={`px-4 py-2 rounded-full font-bold ${comfortableWithLongDrives === 'yes' ? "bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A]" : "bg-white/10 border border-white/20 text-gray-200"}`}>Yes</button>
              <button type="button" onClick={() => { setComfortableWithLongDrives('no'); props.clearFieldError('comfortableWithLongDrives'); }} className={`px-4 py-2 rounded-full font-bold ${comfortableWithLongDrives === 'no' ? "bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A]" : "bg-white/10 border border-white/20 text-gray-200"}`}>No</button>
            </div>
            {props.fieldErrors.comfortableWithLongDrives && <p className="text-red-400 text-sm mt-1">{props.fieldErrors.comfortableWithLongDrives}</p>}
          </div>
        )}

        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">Number of drivers sharing the trip</label>
          <input type="number" min={1} value={numberOfDrivers} onChange={(e) => { const val = Number(e.target.value) || 1; const max = vehicleType === 'two-wheeler' ? 2 : 6; setNumberOfDrivers(Math.max(1, Math.min(max, val))); props.clearFieldError('numberOfDrivers'); }} max={vehicleType === 'two-wheeler' ? 2 : 6} className="w-24 mt-2 p-4 rounded-xl bg-white/10 border border-white/20 text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15" data-invalid={!!props.fieldErrors.numberOfDrivers} />
          {props.fieldErrors.numberOfDrivers && <p className="text-red-400 text-sm mt-1">{props.fieldErrors.numberOfDrivers}</p>}
        </div>
    </div>
  );
}
