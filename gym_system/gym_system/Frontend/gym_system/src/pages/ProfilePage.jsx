import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import authService from "../services/auth.service";
import bodyInfoService from "../services/bodyInfo.service";
import clientProfileService from "../services/clientProfile.service";
import trainerProfileService from "../services/trainerProfile.service";
import trainingSubscriptionService from "../services/trainingSubscription.service";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form States
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    contact: user?.contact || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      district: user?.address?.district || "",
      province: user?.address?.province || "",
      postal_code: user?.address?.postal_code || "",
      country: user?.address?.country || "Sri Lanka",
    },
    profile_image: user?.profile_image || "",
    dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
  });

  // Body Info Form States
  const [bodyInfoData, setBodyInfoData] = useState({
    height: "",
    weight: "",
    gender: "",
    goal: "",
  });

  // Client Profile Form States
  const [clientProfileData, setClientProfileData] = useState({
    activity_level: "",
    medical_notes: "",
    membership_status: "active",
  });

  // Trainer Profile Form States
  const [trainerProfileData, setTrainerProfileData] = useState({
    specialization: "",
    bio: "",
    certifications: "",
    available_to: "",
  });

  const [hasRoleProfile, setHasRoleProfile] = useState(false);
  const [initialRoleProfile, setInitialRoleProfile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [hasBodyInfo, setHasBodyInfo] = useState(false);
  const [initialBodyInfo, setInitialBodyInfo] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentSub, setCurrentSub] = useState(null);

  // Check if profile data has changed
  const isProfileChanged = () => {
    const isBasicChanged =
      profileData.name !== (user?.name || "") ||
      profileData.contact !== (user?.contact || "") ||
      profileData.address.street !== (user?.address?.street || "") ||
      profileData.address.city !== (user?.address?.city || "") ||
      profileData.address.district !== (user?.address?.district || "") ||
      profileData.address.province !== (user?.address?.province || "") ||
      profileData.address.postal_code !== (user?.address?.postal_code || "") ||
      profileData.address.country !== (user?.address?.country || "Sri Lanka") ||
      profileData.profile_image !== (user?.profile_image || "") ||
      profileData.dob !==
        (user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "");

    let isRoleProfileChanged = false;
    if (user?.role === "client") {
      if (!initialRoleProfile && !hasRoleProfile) {
        isRoleProfileChanged =
          !!clientProfileData.activity_level ||
          !!clientProfileData.medical_notes ||
          clientProfileData.membership_status !== "active";
      } else {
        isRoleProfileChanged =
          clientProfileData.activity_level !==
            (initialRoleProfile?.activity_level || "") ||
          clientProfileData.medical_notes !==
            (initialRoleProfile?.medical_notes || "") ||
          clientProfileData.membership_status !==
            (initialRoleProfile?.membership_status || "active");
      }
    } else if (user?.role === "trainer") {
      if (!initialRoleProfile && !hasRoleProfile) {
        isRoleProfileChanged =
          !!trainerProfileData.specialization ||
          !!trainerProfileData.bio ||
          !!trainerProfileData.certifications ||
          !!trainerProfileData.available_to;
      } else {
        isRoleProfileChanged =
          trainerProfileData.specialization !==
            (initialRoleProfile?.specialization || "") ||
          trainerProfileData.bio !== (initialRoleProfile?.bio || "") ||
          trainerProfileData.certifications !==
            (initialRoleProfile?.certifications || "") ||
          trainerProfileData.available_to !==
            (initialRoleProfile?.available_to || "");
      }
    }

    return isBasicChanged || isRoleProfileChanged;
  };

  // Check if body info data has changed
  const isBodyInfoChanged = () => {
    if (!initialBodyInfo && !hasBodyInfo) {
      // If creating new, check if any field is not empty
      return (
        bodyInfoData.height ||
        bodyInfoData.weight ||
        bodyInfoData.gender ||
        bodyInfoData.goal
      );
    }
    return (
      String(bodyInfoData.height) !== String(initialBodyInfo?.height || "") ||
      String(bodyInfoData.weight) !== String(initialBodyInfo?.weight || "") ||
      bodyInfoData.gender !== (initialBodyInfo?.gender || "") ||
      bodyInfoData.goal !== (initialBodyInfo?.goal || "")
    );
  };

  useEffect(() => {
    if (activeTab === "body") {
      fetchBodyInfo();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      if (!user) return;
      try {
        const res = await trainingSubscriptionService.getMySubscriptions();
        if (res.status === "success") {
          const active = (res.subscriptions || []).find(
            (s) => s.status === "active"
          );
          setCurrentSub(active || null);
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
      }
    };
    fetchCurrentSubscription();
  }, [user]);

  useEffect(() => {
    const fetchRoleProfile = async () => {
      if (!user) return;
      try {
        if (user.role === "client") {
          const res = await clientProfileService.getMyProfile();
          if (res.status === "success" && res.profile) {
            const fetchedProfile = {
              activity_level: res.profile.activity_level || "",
              medical_notes: res.profile.medical_notes || "",
              membership_status: res.profile.membership_status || "active",
            };
            setClientProfileData(fetchedProfile);
            setInitialRoleProfile(fetchedProfile);
            setHasRoleProfile(true);
          }
        } else if (user.role === "trainer") {
          const res = await trainerProfileService.getMyProfile();
          if (res.status === "success" && res.profile) {
            const fetchedProfile = {
              specialization: res.profile.specialization || "",
              bio: res.profile.bio || "",
              certifications: (res.profile.certifications || []).join(", "),
              available_to: res.profile.available_to
                ? new Date(res.profile.available_to).toISOString().split("T")[0]
                : "",
            };
            setTrainerProfileData(fetchedProfile);
            setInitialRoleProfile(fetchedProfile);
            setHasRoleProfile(true);
          }
        }
      } catch (err) {
        console.error("Error fetching role profile:", err);
        setHasRoleProfile(false);
      }
    };
    fetchRoleProfile();
  }, [user]);

  const fetchBodyInfo = async () => {
    try {
      setLoading(true);
      const res = await bodyInfoService.getMyBodyInfo();
      if (res.status === "success" && res.info) {
        const fetchedInfo = {
          height: res.info.height || "",
          weight: res.info.weight || "",
          gender: res.info.gender || "",
          goal: res.info.goal || "",
        };
        setBodyInfoData(fetchedInfo);
        setInitialBodyInfo(fetchedInfo);
        setHasBodyInfo(true);
      }
    } catch (err) {
      console.error("Error fetching body info:", err);
      setHasBodyInfo(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    // Determine which state to update based on the input name
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setProfileData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else if (["name", "contact", "dob"].includes(name)) {
      setProfileData({ ...profileData, [name]: value });
    } else if (
      ["activity_level", "medical_notes", "membership_status"].includes(name)
    ) {
      setClientProfileData({ ...clientProfileData, [name]: value });
    } else if (
      ["specialization", "bio", "certifications", "available_to"].includes(name)
    ) {
      setTrainerProfileData({ ...trainerProfileData, [name]: value });
    }

    // Real-time validation if error exists
    if (fieldErrors[name]) {
      const newErrors = { ...fieldErrors };
      if (!value || (typeof value === "string" && !value.trim())) {
        newErrors[name] = `${name.replace("_", " ")} is required`;
      } else {
        delete newErrors[name];
        if (name === "contact" && !/^\+?[0-9\s-]{7,15}$/.test(value)) {
          newErrors.contact = "Please enter a valid contact number";
        }
      }
      setFieldErrors(newErrors);
    }
  };

  const handleBodyChange = (e) => {
    const { name, value } = e.target;
    setBodyInfoData({ ...bodyInfoData, [name]: value });

    // Real-time validation if error exists
    if (
      fieldErrors[name] ||
      fieldErrors.height ||
      fieldErrors.weight ||
      fieldErrors.gender ||
      fieldErrors.goal
    ) {
      const newErrors = { ...fieldErrors };

      // If one is filled, all are required
      const hasAnyField =
        (name === "height" ? value : bodyInfoData.height) ||
        (name === "weight" ? value : bodyInfoData.weight) ||
        (name === "gender" ? value : bodyInfoData.gender) ||
        (name === "goal" ? value : bodyInfoData.goal);

      if (hasAnyField) {
        if (name === "height" && value) delete newErrors.height;
        if (name === "weight" && value) delete newErrors.weight;
        if (name === "gender" && value) delete newErrors.gender;
        if (name === "goal" && value) delete newErrors.goal;

        // Check range
        if (name === "height" && value && (value < 50 || value > 300))
          newErrors.height = "Height must be between 50 and 300 cm";
        if (name === "weight" && value && (value < 20 || value > 500))
          newErrors.weight = "Weight must be between 20 and 500 kg";
      } else {
        // Clear all if all empty
        delete newErrors.height;
        delete newErrors.weight;
        delete newErrors.gender;
        delete newErrors.goal;
      }
      setFieldErrors(newErrors);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const data = await authService.uploadImage(file);
      if (data.status === "success") {
        const imageUrl = authService.getImageUrl(data.profile_image);
        setProfileData({ ...profileData, profile_image: imageUrl });

        const updatedUser = { ...user, profile_image: imageUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        setMessage({ type: "success", text: "Profile picture updated!" });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Upload failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setMessage({ type: "", text: "" });

    const errors = {};
    if (!profileData.name.trim()) errors.name = "Name is required";
    if (!profileData.contact.trim()) {
      errors.contact = "Contact is required";
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(profileData.contact)) {
      errors.contact = "Please enter a valid contact number";
    }
    if (!profileData.dob) errors.dob = "Date of Birth is required";

    if (!profileData.address.street.trim())
      errors["address.street"] = "Street is required";
    if (!profileData.address.city.trim())
      errors["address.city"] = "City is required";
    if (!profileData.address.district.trim())
      errors["address.district"] = "District is required";

    if (user?.role === "client") {
      if (!clientProfileData.activity_level)
        errors.activity_level = "Activity Level is required";
      if (!clientProfileData.medical_notes.trim())
        errors.medical_notes = "Medical Notes are required";
    } else if (user?.role === "trainer") {
      if (!trainerProfileData.specialization.trim())
        errors.specialization = "Specialization is required";
      if (!trainerProfileData.available_to)
        errors.available_to = "Availability Date is required";
      if (!trainerProfileData.certifications)
        errors.certifications = "Certifications are required";
      if (!trainerProfileData.bio.trim()) errors.bio = "Bio is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: profileData.name,
        contact: profileData.contact,
        address: profileData.address,
        profile_image: profileData.profile_image,
        dob: profileData.dob || null,
      };

      const data = await authService.updateProfile(updateData);
      if (data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        // Also update role specific profile
        try {
          if (user.role === "client") {
            const roleData = {
              user_id: data.user?._id || data.user?.id || user?._id || user?.id,
              activity_level: clientProfileData.activity_level || "beginner",
              medical_notes: clientProfileData.medical_notes || null,
              membership_status:
                clientProfileData.membership_status || "active",
            };
            if (hasRoleProfile) {
              await clientProfileService.updateMyProfile(roleData);
            } else {
              await clientProfileService.createMyProfile(roleData);
              setHasRoleProfile(true);
            }
            setInitialRoleProfile({ ...clientProfileData });
          } else if (user.role === "trainer") {
            const roleData = {
              user_id: data.user?._id || data.user?.id || user?._id || user?.id,
              specialization: trainerProfileData.specialization || null,
              bio: trainerProfileData.bio || null,
              certifications: trainerProfileData.certifications
                ? String(trainerProfileData.certifications)
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s)
                : [],
              available_to: trainerProfileData.available_to || null,
            };
            if (hasRoleProfile) {
              await trainerProfileService.updateMyProfile(roleData);
            } else {
              await trainerProfileService.createMyProfile(roleData);
              setHasRoleProfile(true);
            }
            setInitialRoleProfile({ ...trainerProfileData });
          }
          setMessage({
            type: "success",
            text: "Profile updated successfully!",
          });
        } catch (roleErr) {
          const errorMsg =
            roleErr.response?.data?.message ||
            "Basic profile updated but failed to update specific profile details.";
          console.error(
            "Failed to update role profile",
            roleErr.response?.data
          );
          setMessage({ type: "error", text: errorMsg });
          if (roleErr.response?.data?.errors) {
            const backendErrors = {};
            roleErr.response.data.errors.forEach((e) => {
              backendErrors[e.field] = e.message;
            });
            setFieldErrors((prev) => ({ ...prev, ...backendErrors }));
          }
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update profile.";
      setMessage({ type: "error", text: errorMsg });
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach((e) => {
          backendErrors[e.field] = e.message;
        });
        setFieldErrors((prev) => ({ ...prev, ...backendErrors }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBodySubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setMessage({ type: "", text: "" });

    const errors = {};
    const hasAnyField =
      bodyInfoData.height ||
      bodyInfoData.weight ||
      bodyInfoData.gender ||
      bodyInfoData.goal;

    if (hasAnyField) {
      if (!bodyInfoData.height) errors.height = "Height is required";
      if (!bodyInfoData.weight) errors.weight = "Weight is required";
      if (!bodyInfoData.gender) errors.gender = "Gender is required";
      if (!bodyInfoData.goal) errors.goal = "Goal is required";
    }

    if (
      bodyInfoData.height &&
      (bodyInfoData.height < 50 || bodyInfoData.height > 300)
    ) {
      errors.height = "Height must be between 50 and 300 cm";
    }
    if (
      bodyInfoData.weight &&
      (bodyInfoData.weight < 20 || bodyInfoData.weight > 500)
    ) {
      errors.weight = "Weight must be between 20 and 500 kg";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      let res;
      // Convert height and weight to numbers for backend DTO validation
      const submissionData = {
        ...bodyInfoData,
        height: bodyInfoData.height ? Number(bodyInfoData.height) : null,
        weight: bodyInfoData.weight ? Number(bodyInfoData.weight) : null,
      };

      if (hasBodyInfo) {
        res = await bodyInfoService.updateMyBodyInfo(submissionData);
      } else {
        res = await bodyInfoService.createMyBodyInfo(submissionData);
      }

      if (res.status === "success") {
        setMessage({
          type: "success",
          text: "Body information updated successfully!",
        });
        setInitialBodyInfo({ ...bodyInfoData });
        setHasBodyInfo(true);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update body info.";
      setMessage({ type: "error", text: errorMsg });

      // Capture detailed validation errors from backend
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach((e) => {
          backendErrors[e.field] = e.message;
        });
        setFieldErrors((prev) => ({ ...prev, ...backendErrors }));
      }

      console.error("Body info submission error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-[#121212] min-h-screen flex items-center justify-center text-white">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      <div className="flex-grow pt-24 md:pt-32 pb-16 px-4 md:px-16 container mx-auto max-w-4xl">
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-900/20 to-black p-8 border-b border-gray-800 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-red-600 bg-gray-800 flex items-center justify-center overflow-hidden">
                {profileData.profile_image ? (
                  <img
                    src={authService.getImageUrl(profileData.profile_image)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-red-600 p-2.5 rounded-full border-2 border-[#1a1a1a] shadow-xl cursor-pointer hover:bg-red-700 transition">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter break-words">
                {user.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span className="bg-red-600 text-white font-bold tracking-widest text-[10px] uppercase px-2 py-0.5 rounded">
                  {user.role} MEMBER
                </span>
                <span className="bg-gray-800 text-gray-400 font-bold tracking-widest text-[10px] uppercase px-2 py-0.5 rounded">
                  Since {new Date(user.createdAt).getFullYear()}
                </span>
              </div>
              {currentSub ? (
                <div className="mt-3 flex flex-wrap justify-center md:justify-start items-center gap-2">
                  <span className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/10 border border-yellow-600/30 text-yellow-400 font-black tracking-widest text-[10px] uppercase px-3 py-1 rounded-lg flex items-center gap-1.5">
                    💎 {currentSub.subscription_plan_id?.name || "Plan"}
                  </span>
                  <span
                    className={`font-bold tracking-widest text-[9px] uppercase px-2 py-0.5 rounded ${
                      currentSub.status === "active"
                        ? "bg-green-600/20 text-green-400"
                        : "bg-yellow-600/20 text-yellow-400"
                    }`}
                  >
                    {currentSub.status}
                  </span>
                  {currentSub.expire_date && (
                    <span className="text-gray-500 text-[9px] font-bold tracking-wider">
                      Expires:{" "}
                      {new Date(currentSub.expire_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-gray-600 text-[10px] font-bold uppercase tracking-widest italic">
                  No Active Subscription
                </p>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-800 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                setActiveTab("profile");
                setMessage({ type: "", text: "" });
              }}
              className={`flex-1 min-w-[150px] py-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                activeTab === "profile"
                  ? "text-white border-b-2 border-red-600 bg-red-600/5"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => {
                setActiveTab("body");
                setMessage({ type: "", text: "" });
              }}
              className={`flex-1 min-w-[150px] py-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                activeTab === "body"
                  ? "text-white border-b-2 border-red-600 bg-red-600/5"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Body Information
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-8">
            {message.text && (
              <div
                className={`mb-8 p-4 rounded-md text-xs font-bold border flex items-center justify-between transition-all duration-300 ${
                  message.type === "success"
                    ? "bg-green-600/10 border-green-600/50 text-green-500"
                    : "bg-red-600/10 border-red-600/50 text-red-500"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      message.type === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span>{message.text}</span>
                </div>
                <button
                  onClick={() => setMessage({ type: "", text: "" })}
                  className="hover:opacity-70 transition-opacity p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            {activeTab === "profile" ? (
              <form
                onSubmit={handleProfileSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition ${
                      fieldErrors.name ? "border-red-600" : "border-gray-800"
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Email Address
                  </label>
                  <input
                    value={user.email}
                    readOnly
                    className="w-full bg-[#121212]/50 border border-gray-800 rounded p-3 text-sm text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={profileData.dob}
                    onChange={handleProfileChange}
                    className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition border-gray-800 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert ${
                      fieldErrors.dob ? "border-red-600" : "border-gray-800"
                    }`}
                  />
                  {fieldErrors.dob && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                      {fieldErrors.dob}
                    </p>
                  )}
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                    Contact Number
                  </label>
                  <input
                    name="contact"
                    placeholder="+94 77 123 4567"
                    value={profileData.contact}
                    onChange={handleProfileChange}
                    className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition ${
                      fieldErrors.contact ? "border-red-600" : "border-gray-800"
                    }`}
                  />
                  {fieldErrors.contact && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                      {fieldErrors.contact}
                    </p>
                  )}
                </div>

                <div className="col-span-full border-t border-gray-800/50 pt-6 mt-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-6">
                    Residential Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-full space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        Street Address
                      </label>
                      <input
                        name="address.street"
                        placeholder="Street Name / House No"
                        value={profileData.address.street}
                        onChange={handleProfileChange}
                        className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition ${
                          fieldErrors["address.street"]
                            ? "border-red-600"
                            : "border-gray-800"
                        }`}
                      />
                      {fieldErrors["address.street"] && (
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                          {fieldErrors["address.street"]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        City
                      </label>
                      <input
                        name="address.city"
                        placeholder="Colombo"
                        value={profileData.address.city}
                        onChange={handleProfileChange}
                        className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition ${
                          fieldErrors["address.city"]
                            ? "border-red-600"
                            : "border-gray-800"
                        }`}
                      />
                      {fieldErrors["address.city"] && (
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                          {fieldErrors["address.city"]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        District
                      </label>
                      <input
                        name="address.district"
                        placeholder="Colombo"
                        value={profileData.address.district}
                        onChange={handleProfileChange}
                        className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition ${
                          fieldErrors["address.district"]
                            ? "border-red-600"
                            : "border-gray-800"
                        }`}
                      />
                      {fieldErrors["address.district"] && (
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                          {fieldErrors["address.district"]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        Province
                      </label>
                      <input
                        name="address.province"
                        placeholder="Western"
                        value={profileData.address.province}
                        onChange={handleProfileChange}
                        className="w-full bg-[#121212] border border-gray-800 rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition"
                      />
                    </div>

                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        Postal Code
                      </label>
                      <input
                        name="address.postal_code"
                        placeholder="10100"
                        value={profileData.address.postal_code}
                        onChange={handleProfileChange}
                        className="w-full bg-[#121212] border border-gray-800 rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition"
                      />
                    </div>

                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        Country
                      </label>
                      <input
                        name="address.country"
                        value={profileData.address.country}
                        onChange={handleProfileChange}
                        className="w-full bg-[#121212] border border-gray-800 rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition"
                      />
                    </div>
                  </div>
                </div>

                {user?.role === "client" && (
                  <>
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        Activity Level
                      </label>
                      <select
                        name="activity_level"
                        value={clientProfileData.activity_level}
                        onChange={handleProfileChange}
                        className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition appearance-none ${
                          fieldErrors.activity_level
                            ? "border-red-600"
                            : "border-gray-800"
                        }`}
                      >
                        <option value="">Select Level</option>
                        <option value="sedentary">Sedentary</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      {fieldErrors.activity_level && (
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                          {fieldErrors.activity_level}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        Membership Status
                      </label>
                      <select
                        name="membership_status"
                        value={clientProfileData.membership_status}
                        onChange={handleProfileChange}
                        disabled
                        className={`w-full bg-[#121212]/60 border border-gray-800 rounded p-3 text-sm text-gray-400 cursor-not-allowed focus:outline-none appearance-none`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    <div className="col-span-full space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        Medical Notes
                      </label>
                      <textarea
                        name="medical_notes"
                        rows="2"
                        placeholder="Any injuries or medical conditions..."
                        value={clientProfileData.medical_notes}
                        onChange={handleProfileChange}
                        className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition resize-none ${
                          fieldErrors.medical_notes
                            ? "border-red-600"
                            : "border-gray-800"
                        }`}
                      ></textarea>
                      {fieldErrors.medical_notes && (
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                          {fieldErrors.medical_notes}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {user?.role === "trainer" && (
                  <>
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        Specialization
                      </label>
                      <input
                        name="specialization"
                        placeholder="e.g. Weightlifting, Yoga"
                        value={trainerProfileData.specialization}
                        onChange={handleProfileChange}
                        className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition ${
                          fieldErrors.specialization
                            ? "border-red-600"
                            : "border-gray-800"
                        }`}
                      />
                      {fieldErrors.specialization && (
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                          {fieldErrors.specialization}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        Availability Date
                      </label>
                      <input
                        type="date"
                        name="available_to"
                        value={trainerProfileData.available_to}
                        onChange={handleProfileChange}
                        className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert ${
                          fieldErrors.available_to
                            ? "border-red-600"
                            : "border-gray-800"
                        }`}
                      />
                      {fieldErrors.available_to && (
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                          {fieldErrors.available_to}
                        </p>
                      )}
                    </div>

                    <div className="col-span-full space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        Certifications (comma separated)
                      </label>
                      <input
                        name="certifications"
                        placeholder="e.g. ACE, NASM"
                        value={trainerProfileData.certifications}
                        onChange={handleProfileChange}
                        className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition ${
                          fieldErrors.certifications
                            ? "border-red-600"
                            : "border-gray-800"
                        }`}
                      />
                      {fieldErrors.certifications && (
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                          {fieldErrors.certifications}
                        </p>
                      )}
                    </div>

                    <div className="col-span-full space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        rows="3"
                        placeholder="Tell us about your experience..."
                        value={trainerProfileData.bio}
                        onChange={handleProfileChange}
                        className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition resize-none ${
                          fieldErrors.bio ? "border-red-600" : "border-gray-800"
                        }`}
                      ></textarea>
                      {fieldErrors.bio && (
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                          {fieldErrors.bio}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="col-span-full pt-4">
                  <button
                    type="submit"
                    disabled={loading || !isProfileChanged()}
                    className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded text-[11px] transition tracking-[0.2em] uppercase disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                  >
                    {loading ? "SAVING..." : "SAVE PROFILE"}
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleBodySubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                    Height (cm)
                  </label>
                  <input
                    name="height"
                    type="number"
                    placeholder="e.g. 175"
                    value={bodyInfoData.height}
                    onChange={handleBodyChange}
                    className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition ${
                      fieldErrors.height ? "border-red-600" : "border-gray-800"
                    }`}
                  />
                  {fieldErrors.height && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                      {fieldErrors.height}
                    </p>
                  )}
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                    Weight (kg)
                  </label>
                  <input
                    name="weight"
                    type="number"
                    placeholder="e.g. 70"
                    value={bodyInfoData.weight}
                    onChange={handleBodyChange}
                    className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition ${
                      fieldErrors.weight ? "border-red-600" : "border-gray-800"
                    }`}
                  />
                  {fieldErrors.weight && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                      {fieldErrors.weight}
                    </p>
                  )}
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={bodyInfoData.gender}
                    onChange={handleBodyChange}
                    className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition appearance-none ${
                      fieldErrors.gender ? "border-red-600" : "border-gray-800"
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {fieldErrors.gender && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                      {fieldErrors.gender}
                    </p>
                  )}
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-red-600 transition-colors">
                    Fitness Goal
                  </label>
                  <select
                    name="goal"
                    value={bodyInfoData.goal}
                    onChange={handleBodyChange}
                    className={`w-full bg-[#121212] border rounded p-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition appearance-none ${
                      fieldErrors.goal ? "border-red-600" : "border-gray-800"
                    }`}
                  >
                    <option value="">Select Goal</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="fitness">General Fitness</option>
                  </select>
                  {fieldErrors.goal && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                      {fieldErrors.goal}
                    </p>
                  )}
                </div>

                <div className="col-span-full pt-4">
                  <button
                    type="submit"
                    disabled={loading || !isBodyInfoChanged()}
                    className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded text-[11px] transition tracking-[0.2em] uppercase disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                  >
                    {loading
                      ? "UPDATING..."
                      : hasBodyInfo
                      ? "UPDATE BODY INFO"
                      : "CREATE BODY INFO"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
