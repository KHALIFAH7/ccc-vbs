"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CONFIG, ageGroupFor } from "@/lib/config";

export default function Home() {
  const [tab, setTab] = useState<"child" | "volunteer">("child");

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <div className="stamp-dot">C</div>
            <div className="nav-brand-text">
              CCC Kids Adventure
              <span>Vacation Bible School</span>
            </div>
          </div>
          <div className="nav-links">
            <a href="#schedule">Schedule</a>
            <a href="#ages">Age Groups</a>
            <a href="#register">Register</a>
            <a href="/admin" className="nav-admin" style={{ alignSelf: "center" }}>
              Admin
            </a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="stamp">
          <div className="stamp-label">Boarding</div>
          <div className="stamp-date">
            AUG
            <br />
            2026
          </div>
        </div>
        <div className="hero-inner">
          <div className="eyebrow">Calvary Charismatic Centre &middot; Children&apos;s Ministry</div>
          <h1>{CONFIG.heroTitle}</h1>
          <p className="hero-verse">{CONFIG.heroVerse}</p>
          <div className="hero-cta">
            <a href="#register" className="btn btn-primary" onClick={() => setTab("child")}>
              Register a Child
            </a>
            <a href="#register" className="btn btn-outline" onClick={() => setTab("volunteer")}>
              Volunteer With Us
            </a>
          </div>
        </div>
      </header>

      <div className="pass-strip">
        <div className="pass-inner">
          <div className="pass-item">
            <div className="k">Dates</div>
            <div className="v">{CONFIG.dates}</div>
          </div>
          <div className="pass-item">
            <div className="k">Time</div>
            <div className="v">{CONFIG.time}</div>
          </div>
          <div className="pass-item">
            <div className="k">Location</div>
            <div className="v">{CONFIG.location}</div>
          </div>
          <div className="pass-item">
            <div className="k">Ages</div>
            <div className="v">{CONFIG.ages}</div>
          </div>
          <div className="pass-item">
            <div className="k">Fee</div>
            <div className="v">{CONFIG.feeDisplay}</div>
          </div>
        </div>
      </div>

      <section id="schedule">
        <div className="section-head">
          <div className="eyebrow">Five-day journey</div>
          <h2>Program schedule</h2>
          <p>Placeholder daily themes below — swap in this year&apos;s titles and focus verses once confirmed.</p>
        </div>
        <div className="schedule-grid">
          {CONFIG.schedule.map((d) => (
            <div className="day-card" key={d.day}>
              <div className="day-badge mono">{d.day}</div>
              <div className="day-title">{d.title}</div>
              <div className="day-verse">{d.verse}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="ages" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div className="eyebrow">Every stage of the journey</div>
          <h2>Age groups</h2>
          <p>Children are placed automatically based on the age entered at registration.</p>
        </div>
        <div className="age-grid">
          {CONFIG.ageGroups.map((a) => (
            <div className="age-card" key={a.name}>
              <div className="rank mono">{a.rank}</div>
              <div className="name">{a.name}</div>
              <div className="range">{a.range}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="register-section" id="register">
        <div className="wrap" style={{ padding: 0 }}>
          <div className="section-head">
            <div className="eyebrow">Sign up</div>
            <h2>Register</h2>
            <p>Choose whether you&apos;re registering a child or signing up to serve as a volunteer.</p>
          </div>

          <div className="tabs">
            <button
              className={`tab-btn ${tab === "child" ? "active" : ""}`}
              onClick={() => setTab("child")}
            >
              Register a Child
            </button>
            <button
              className={`tab-btn ${tab === "volunteer" ? "active" : ""}`}
              onClick={() => setTab("volunteer")}
            >
              Volunteer
            </button>
          </div>

          {tab === "child" ? <ChildForm /> : <VolunteerForm />}
        </div>
      </section>

      <footer>
        <strong>Calvary Charismatic Centre &middot; Children&apos;s Ministry</strong>
        <br />
        Kumasi, Ghana &middot; Questions? Reach the children&apos;s ministry office.
      </footer>
    </>
  );
}

function ChildForm() {
  const [age, setAge] = useState<number | "">("");
  const [payMethod, setPayMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const group = typeof age === "number" ? ageGroupFor(age) : undefined;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    const record = {
      child_name: String(data.get("childName") || "").trim(),
      age: Number(data.get("age")),
      age_group: group ? group.name : "Unassigned",
      gender: String(data.get("gender") || ""),
      class_level: String(data.get("schoolClass") || ""),
      parent_name: String(data.get("parentName") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      emergency_name: String(data.get("emergencyName") || "").trim(),
      emergency_phone: String(data.get("emergencyPhone") || "").trim(),
      allergies: String(data.get("allergies") || "").trim(),
      newcomer: data.get("newcomer") === "on",
      fee: CONFIG.fee,
      payment_method: String(data.get("paymethod") || ""),
      payment_ref: String(data.get("payref") || "").trim(),
      payment_status: "Pending",
    };

    const { error } = await supabase.from("participants").insert([record]);

    if (error) {
      console.error(error);
      setMsg({ text: "Something went wrong saving this registration. Please try again.", ok: false });
    } else {
      const successText =
        record.payment_method === "Cash at church"
          ? `${record.child_name} registered! Placed in ${record.age_group}. Please bring ${CONFIG.feeDisplay} in cash on day one.`
          : `${record.child_name} registered! Placed in ${record.age_group}. We'll confirm your payment shortly.`;
      setMsg({ text: successText, ok: true });
      form.reset();
      setAge("");
      setPayMethod("");
    }
    setSubmitting(false);
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="field">
          <label>Child&apos;s full name *</label>
          <input type="text" name="childName" required />
        </div>
        <div className="field">
          <label>Age *</label>
          <input
            type="number"
            name="age"
            min={1}
            max={16}
            required
            value={age}
            onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
          />
        </div>
      </div>
      <div className="helper-text" style={{ margin: "-10px 0 16px" }}>
        {typeof age === "number" && age > 0
          ? group
            ? `Placed in: ${group.name} (${group.range})`
            : "No matching age group — please check with the office."
          : ""}
      </div>

      <div className="form-row">
        <div className="field">
          <label>Gender *</label>
          <select name="gender" required defaultValue="">
            <option value="" disabled>
              Select
            </option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div className="field">
          <label>Class *</label>
          <select name="schoolClass" required defaultValue="">
            <option value="" disabled>
              Select class
            </option>
            <option>Creche</option>
            <option>Nursery 1</option>
            <option>Nursery 2</option>
            <option>KG 1</option>
            <option>KG 2</option>
            <option>Class 1</option>
            <option>Class 2</option>
            <option>Class 3</option>
            <option>Class 4</option>
            <option>Class 5</option>
            <option>Class 6</option>
            <option>JHS 1</option>
            <option>JHS 2</option>
            <option>JHS 3</option>
            <option>SHS 1</option>
            <option>SHS 2</option>
            <option>SHS 3</option>
            <option>Not in school</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>Parent / guardian name *</label>
          <input type="text" name="parentName" required />
        </div>
        <div className="field">
          <label>Parent phone number *</label>
          <input type="tel" name="phone" required />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>Emergency contact name</label>
          <input type="text" name="emergencyName" />
        </div>
        <div className="field">
          <label>Emergency contact phone</label>
          <input type="tel" name="emergencyPhone" />
        </div>
      </div>

      <div className="field">
        <label>Allergies / medical notes</label>
        <textarea name="allergies" placeholder="e.g. peanut allergy, asthma — leave blank if none" />
      </div>

      <div className="checkbox-item" style={{ marginBottom: 20 }}>
        <input type="checkbox" name="newcomer" id="newcomer" />
        <label htmlFor="newcomer" style={{ textTransform: "none", fontWeight: 500, fontSize: 13.5 }}>
          This child is new to CCC / a first-time visitor
        </label>
      </div>

      <div className="payment-box">
        <div className="payment-box-head">
          <div>
            <div className="field-label-lg">Registration fee</div>
            <div className="fee-amount mono">{CONFIG.feeDisplay}</div>
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label>How will you pay? *</label>
          <select
            name="paymethod"
            required
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
          >
            <option value="">Select payment method</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash at church">Cash at church</option>
          </select>
        </div>
        {(payMethod === "Mobile Money" || payMethod === "Bank Transfer") && (
          <div className="field">
            <label>Transaction / reference number</label>
            <input type="text" name="payref" placeholder="e.g. MoMo transaction ID" />
            <div className="helper-text">
              Enter the reference from your Mobile Money or bank transfer so the office can match your
              payment.
            </div>
          </div>
        )}
        {payMethod === "Cash at church" && (
          <div className="helper-text">
            Please bring {CONFIG.feeDisplay} in cash on the first day of the program.
          </div>
        )}
      </div>

      <div className="submit-row">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Registration"}
        </button>
        {msg && <span className={`form-msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}

function VolunteerForm() {
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const areaOptions = [
    "Teaching",
    "Crafts",
    "Music & Worship",
    "Games & Sports",
    "Registration Desk",
    "Safety & Security",
    "Kitchen & Refreshments",
    "Transportation",
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    const areas = data.getAll("areas").map(String);
    const days = data.getAll("days").map(String);

    if (areas.length === 0 || days.length === 0) {
      setMsg({ text: "Please select at least one area of interest and one available day.", ok: false });
      return;
    }

    setSubmitting(true);

    const record = {
      full_name: String(data.get("fullName") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      areas,
      days,
      experience: String(data.get("experience") || "").trim(),
    };

    const { error } = await supabase.from("volunteers").insert([record]);

    if (error) {
      console.error(error);
      setMsg({ text: "Something went wrong saving this registration. Please try again.", ok: false });
    } else {
      setMsg({ text: `Thank you, ${record.full_name}! We'll be in touch.`, ok: true });
      form.reset();
    }
    setSubmitting(false);
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="field">
          <label>Full name *</label>
          <input type="text" name="fullName" required />
        </div>
        <div className="field">
          <label>Phone number *</label>
          <input type="tel" name="phone" required />
        </div>
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" name="email" />
      </div>
      <div className="field">
        <label>Area(s) of interest *</label>
        <div className="checkbox-grid">
          {areaOptions.map((a) => (
            <label className="checkbox-item" key={a}>
              <input type="checkbox" name="areas" value={a} /> {a}
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Available day(s) *</label>
        <div className="checkbox-grid">
          {CONFIG.days.map((d) => (
            <label className="checkbox-item" key={d}>
              <input type="checkbox" name="days" value={d} /> {d}
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Prior experience with children (optional)</label>
        <textarea name="experience" />
      </div>
      <div className="submit-row">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Registration"}
        </button>
        {msg && <span className={`form-msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
