import { Button } from "@/components/ui/button";
import { Activity, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <Activity className="h-6 w-6 text-primary" />
          MediMap AI
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/consultation" className="hover:text-foreground transition-colors">Consultation</Link>
          <Link to="/clinics" className="hover:text-foreground transition-colors">Find Clinics</Link>
          <Button size="sm" onClick={() => navigate("/consultation")}>Start Consultation</Button>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-3 animate-fade-in">
          <Link to="/" className="text-sm py-2" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/consultation" className="text-sm py-2" onClick={() => setOpen(false)}>Consultation</Link>
          <Link to="/clinics" className="text-sm py-2" onClick={() => setOpen(false)}>Find Clinics</Link>
          <Button size="sm" onClick={() => { setOpen(false); navigate("/consultation"); }}>Start Consultation</Button>
        </div>
      )}
    </nav>
  );
}
