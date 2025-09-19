import React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, Image as ImageIcon, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Option = { id: string; name: string };

const MOCK_CITIES: Option[] = [
	{ id: "1", name: "Cebu City" },
	{ id: "2", name: "Mandaue" },
	{ id: "3", name: "Lapu-Lapu City" },
];

const MOCK_MUNICIPALITIES: Option[] = [
	{ id: "10", name: "Toledo" },
	{ id: "11", name: "Danao" },
	{ id: "12", name: "Talisay" },
];

const PROPERTY_TYPES = [
	"Apartment",
	"Condominium",
    "Boarding House",
	"Single House",
];

function SearchSelect({
	label,
	placeholder,
	value,
	onChange,
	options,
	disabled,
}: {
	label: string;
	placeholder: string;
	value: Option | null;
	onChange: (opt: Option | null) => void;
	options: Option[];
	disabled?: boolean;
}) {
	const [query, setQuery] = React.useState("");
	const [open, setOpen] = React.useState(false);
	const filtered = React.useMemo(() => {
		const q = query.trim().toLowerCase();
		return !q ? options : options.filter((o) => o.name.toLowerCase().includes(q));
	}, [options, query]);

	React.useEffect(() => {
		if (!open) setQuery("");
	}, [open]);

	return (
		<div className="flex flex-col gap-1.5">
			<label className="text-sm font-medium text-foreground/80">{label}</label>
			<div className="relative">
				<button
					type="button"
					disabled={disabled}
					className="w-full h-10 px-3 rounded-md border text-left text-sm bg-background focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none disabled:opacity-60"
					onClick={() => setOpen((p) => !p)}
				>
					{value ? value.name : <span className="text-muted-foreground">{placeholder}</span>}
				</button>
				{open && !disabled && (
					<div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
						<div className="p-2 border-b">
							<input
								autoFocus
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search..."
								className="w-full h-9 px-2 text-sm rounded-md bg-background outline-none border"
							/>
						</div>
						<ul className="max-h-56 overflow-auto py-1">
							{filtered.length === 0 && (
								<li className="px-3 py-2 text-sm text-muted-foreground">No results</li>
							)}
							{filtered.map((opt) => (
								<li key={opt.id}>
									<button
										type="button"
										className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
										onClick={() => {
											onChange(opt);
											setOpen(false);
										}}
									>
										{opt.name}
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
			{value && !disabled && (
				<button
					type="button"
					className="self-start text-xs text-muted-foreground hover:underline"
					onClick={() => onChange(null)}
				>
					Clear
				</button>
			)}
		</div>
	);
}

export default function CreateProperty() {
    const STEPS = ["Basics", "Address", "Location", "Media"] as const;
    const [step, setStep] = React.useState<number>(0);
    const navigate = useNavigate();
	const [title, setTitle] = React.useState("");
	const [type, setType] = React.useState(PROPERTY_TYPES[0]);
	const [street, setStreet] = React.useState("");
	const [barangay, setBarangay] = React.useState("");
	const [zipCode, setZipCode] = React.useState("");

    const [city, setCity] = React.useState<Option | null>(null);
    const [municipality, setMunicipality] = React.useState<Option | null>(null);
    const [localityMode, setLocalityMode] = React.useState<"city" | "municipality" | null>(null);

	const [latitude, setLatitude] = React.useState<string>("");
	const [longitude, setLongitude] = React.useState<string>("");

	const [imageFile, setImageFile] = React.useState<File | null>(null);
	const [imageError, setImageError] = React.useState<string>("");
	const [imagePreview, setImagePreview] = React.useState<string>("");

	const maxBytes = 5 * 1024 * 1024; // 5MB

	function handleImageChange(file: File | null) {
		setImageError("");
		setImagePreview("");
		setImageFile(null);
		if (!file) return;
		if (file.size > maxBytes) {
			setImageError("File exceeds 5MB limit");
			return;
		}
		setImageFile(file);
		const url = URL.createObjectURL(file);
		setImagePreview(url);
	}

    function submitMock(e: React.FormEvent) {
        e.preventDefault();
        if (step < STEPS.length - 1) return;
		const payload = {
			title,
			type,
			street,
			barangay,
			zipCode: zipCode || undefined,
			cityId: city?.id ?? null,
			municipalityId: municipality?.id ?? null,
			latitude: latitude ? parseFloat(latitude) : null,
			longitude: longitude ? parseFloat(longitude) : null,
			mainImageName: imageFile?.name ?? null,
		};
		console.log("Mock submit property:", payload);
		alert("Mock submit successful. Check console for payload.");
	}

	const latNum = latitude ? Number(latitude) : null;
	const lngNum = longitude ? Number(longitude) : null;
	const mapSrc =
		latNum !== null && !Number.isNaN(latNum) && lngNum !== null && !Number.isNaN(lngNum)
			? `https://www.google.com/maps?q=${latNum},${lngNum}&z=16&output=embed`
			: "";

    // Step validations
    const isBasicsValid = title.trim().length > 0 && !!type;
    const hasOneLocality = (localityMode === "city" && !!city) || (localityMode === "municipality" && !!municipality);
    const isAddressValid = street.trim().length > 0 && barangay.trim().length > 0 && hasOneLocality;
    const coordsBothEmpty = latitude.trim() === "" && longitude.trim() === "";
    const coordsBothFilled = latitude.trim() !== "" && longitude.trim() !== "";
    const coordsAreNumbers = coordsBothFilled && !Number.isNaN(Number(latitude)) && !Number.isNaN(Number(longitude));
    const isLocationValid = coordsBothEmpty || (coordsBothFilled && coordsAreNumbers);

    function nextStep() {
        if (step === 0 && !isBasicsValid) return;
        if (step === 1 && !isAddressValid) return;
        if (step === 2 && !isLocationValid) return;
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }

    

	return (
        <div className="relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/60 to-sky-50/40" />
            <div className="mx-auto max-w-5xl p-4 md:p-8">
                <div className="mb-4">
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium">
                        <Home className="w-4 h-4" />
                        <span>Landlord • Create Property</span>
                    </div>
                </div>
                <Card className="rounded-2xl border-gray-100 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">Create Property</CardTitle>
                        <CardDescription>Follow the steps. Choose either City or Municipality. Image ≤ 5MB.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Stepper */}
                        <ol className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {STEPS.map((label, idx) => {
                                const active = idx === step;
                                const completed = idx < step;
                                const Icon = idx === 0 ? FileText : idx === 1 ? MapPin : idx === 2 ? MapPin : ImageIcon;
                                return (
                                    <li key={label} className="flex items-center gap-3">
                                        <div className={`relative size-8 grid place-items-center rounded-full border text-xs font-semibold transition-all ${completed ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white border-transparent" : active ? "bg-white text-emerald-700 border-emerald-200 shadow-sm" : "bg-white text-gray-500 border-gray-200"}`}>
                                            {completed ? (
                                                <span>✓</span>
                                            ) : (
                                                <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-gray-500"}`} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className={`text-sm ${active ? "font-semibold text-gray-900" : "text-gray-600"}`}>{label}</div>
                                            <div className="hidden md:block text-xs text-gray-500">
                                                {idx === 0 && "Title & type"}
                                                {idx === 1 && "Address & locality"}
                                                {idx === 2 && "Map coordinates"}
                                                {idx === 3 && "Featured image"}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>

                        <form
                            onSubmit={submitMock}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (step < STEPS.length - 1) {
                                        nextStep();
                                    }
                                }
                            }}
                        >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basics */}
                            {step === 0 && (
                                <>
                                    <div className="flex flex-col gap-1.5 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Title</label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Cozy Apartment near IT Park"
                                            className="h-11 px-3 rounded-lg border border-gray-200 bg-white outline-none text-sm focus-visible:ring-[3px] focus-visible:ring-emerald-500/30"
                                            required
                                        />
                                        <p className="text-xs text-gray-500">Short, descriptive title for your listing.</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-700">Type</label>
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="h-11 px-3 rounded-lg border border-gray-200 bg-white outline-none text-sm focus-visible:ring-[3px] focus-visible:ring-emerald-500/30"
                                        >
                                            {PROPERTY_TYPES.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Address */}
                            {step === 1 && (
                                <>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-700">Street</label>
                                        <input
                                            value={street}
                                            onChange={(e) => setStreet(e.target.value)}
                                            placeholder="House No., Street Name"
                                            className="h-11 px-3 rounded-lg border border-gray-200 bg-white outline-none text-sm focus-visible:ring-[3px] focus-visible:ring-emerald-500/30"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-700">Barangay</label>
                                        <input
                                            value={barangay}
                                            onChange={(e) => setBarangay(e.target.value)}
                                            placeholder="Barangay"
                                            className="h-11 px-3 rounded-lg border border-gray-200 bg-white outline-none text-sm focus-visible:ring-[3px] focus-visible:ring-emerald-500/30"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-700">ZIP Code (optional)</label>
                                        <input
                                            value={zipCode}
                                            onChange={(e) => setZipCode(e.target.value)}
                                            placeholder="e.g., 6000"
                                            className="h-11 px-3 rounded-lg border border-gray-200 bg-white outline-none text-sm focus-visible:ring-[3px] focus-visible:ring-emerald-500/30"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                        />
                                    </div>
                                    {/* Locality mode toggle */}
                                    <div className="md:col-span-2">
                                        <div className="text-sm font-medium text-gray-700 mb-2">Locality Type</div>
                                        <div className="inline-flex rounded-lg border border-gray-200 bg-white overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setLocalityMode("city");
                                                    setMunicipality(null);
                                                }}
                                                className={`px-4 py-2 text-sm ${localityMode === "city" ? "bg-emerald-50 text-emerald-700" : "text-gray-600"}`}
                                            >
                                                City
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setLocalityMode("municipality");
                                                    setCity(null);
                                                }}
                                                className={`px-4 py-2 text-sm border-l border-gray-200 ${localityMode === "municipality" ? "bg-emerald-50 text-emerald-700" : "text-gray-600"}`}
                                            >
                                                Municipality
                                            </button>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Choose locality type, then search below.</p>
                                    </div>
                                    {localityMode === "city" && (
                                        <div className="md:col-span-1">
                                            <SearchSelect
                                                label="City"
                                                placeholder="Search city"
                                                value={city}
                                                onChange={(opt) => setCity(opt)}
                                                options={MOCK_CITIES}
                                            />
                                        </div>
                                    )}
                                    {localityMode === "municipality" && (
                                        <div className="md:col-span-1">
                                            <SearchSelect
                                                label="Municipality"
                                                placeholder="Search municipality"
                                                value={municipality}
                                                onChange={(opt) => setMunicipality(opt)}
                                                options={MOCK_MUNICIPALITIES}
                                            />
                                        </div>
                                    )}
                                    <div className="md:col-span-2 text-xs text-gray-500">Select either a City or a Municipality.</div>
                                </>
                            )}

                            {/* Location */}
                            {step === 2 && (
                                <>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-700">Latitude</label>
                                        <input
                                            value={latitude}
                                            onChange={(e) => setLatitude(e.target.value)}
                                            placeholder="e.g., 10.3157"
                                            className="h-11 px-3 rounded-lg border border-gray-200 bg-white outline-none text-sm focus-visible:ring-[3px] focus-visible:ring-emerald-500/30"
                                            inputMode="decimal"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-gray-700">Longitude</label>
                                        <input
                                            value={longitude}
                                            onChange={(e) => setLongitude(e.target.value)}
                                            placeholder="e.g., 123.8854"
                                            className="h-11 px-3 rounded-lg border border-gray-200 bg-white outline-none text-sm focus-visible:ring-[3px] focus-visible:ring-emerald-500/30"
                                            inputMode="decimal"
                                        />
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-gray-700">Map Preview</label>
                                            <div className="aspect-video w-full rounded-md border overflow-hidden bg-muted">
                                                {mapSrc ? (
                                                    <iframe title="map" src={mapSrc} className="w-full h-full border-0" loading="lazy" />
                                                ) : (
                                                    <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">
                                                        Enter latitude and longitude to preview map
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Media */}
                            {step === 3 && (
                                <>
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-gray-700">Main Image (≤ 5MB)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                                                className="text-sm"
                                            />
                                            {imageError && <p className="text-xs text-destructive">{imageError}</p>}
                                            {imagePreview && (
                                                <img src={imagePreview} alt="Preview" className="mt-2 h-40 w-auto rounded-md border object-cover" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-sm text-gray-600">Optional: Upload a featured image for your property listing.</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer Actions */}
                            <div className="flex items-center justify-between gap-3 pt-8">
                                <Button type="button" variant="outline" onClick={() => navigate('/landlord/properties')}>Back</Button>
                                <div className="flex items-center gap-3">
                                    <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                                    {step < STEPS.length - 1 ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="bg-gradient-to-r from-emerald-600 to-sky-600 text-white hover:from-emerald-600/90 hover:to-sky-600/90"
                                            disabled={(step === 0 && !isBasicsValid) || (step === 1 && !isAddressValid) || (step === 2 && !isLocationValid)}
                                        >
                                            Next
                                        </Button>
                                    ) : (
                                        <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-sky-600 text-white hover:from-emerald-600/90 hover:to-sky-600/90">Save (Mock)</Button>
                                    )}
                                </div>
                            </div>
                    </form>
                    </CardContent>
                </Card>
            </div>
		</div>
	);
}


