import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";

// UI Components (ShadCN)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { CalendarDays, MapPin, Clock, ImagePlus } from "lucide-react";

export default function EventCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🔒 Restrict Student Access
  if (user?.role === "student") {
    return (
      <Card className="max-w-xl mx-auto mt-10 p-5 text-center border-red-400 bg-red-50 dark:bg-red-900/20">
        <CardTitle className="text-red-600 dark:text-red-400">
          Access Denied
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Only alumni, faculty or admin can create events.
        </p>
      </Card>
    );
  }

  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "general",
    banner: "",
  });

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/events", eventData);
      alert("🎉 Event Created Successfully!");
      navigate("/events");
    } catch (err) {
      console.error(err);
      alert("Failed to create event. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Card className="shadow-2xl backdrop-blur-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60">
        
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Create a New Event
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Event Title */}
            <div className="space-y-2">
              <Label>Event Title</Label>
              <Input
                name="title"
                placeholder="Ex: Hackathon 2025"
                required
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Event Description</Label>
              <Textarea
                name="description"
                placeholder="Describe event agenda, guests, requirements..."
                rows={5}
                required
                onChange={handleChange}
              />
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <Label>Banner Image (URL)</Label>
              <div className="flex gap-3 items-center">
                <Input
                  name="banner"
                  placeholder="https://example.com/banner.jpg"
                  onChange={handleChange}
                />
                <Button variant="outline" className="flex gap-2">
                  <ImagePlus size={16} /> Add Banner
                </Button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays size={16} /> Date
                </Label>
                <Input type="date" name="date" required onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock size={16} /> Time
                </Label>
                <Input type="time" name="time" required onChange={handleChange} />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin size={16} /> Location
              </Label>
              <Input
                name="location"
                placeholder="Main Auditorium, BCET Campus"
                required
                onChange={handleChange}
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                defaultValue="general"
                onValueChange={(value) =>
                  setEventData({ ...eventData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-lg py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:scale-[1.02] transition-all"
            >
              {loading ? "Creating..." : "Create Event 🚀"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
