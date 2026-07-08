"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CONFIG } from "@/lib/config";

type Participant = {
  id: string;
  child_name: string;
  age: number;
  age_group: string;
  gender: string;
  class_level: string;
  parent_name: string;
  phone: string;
  emergency_name: string;
  emergency_phone: string;
  allergies: string;
  newcomer: boolean;
  fee: number;
  payment_method: string;
  payment_ref: string;
  payment_status: string;
  created_at: string;
};

type Volunteer = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  areas: string[];
  days: string[];
  experience: string;
  created_at: string;
};

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "0900";

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [activeTable, setActiveTable] = useState<"child" | "volunteer">("child");
  const [loading, setLoading] = useState(false);

  function checkPin() {
    if (pin === ADMIN_PIN) {
      setUnlocked(true);
      loadData();
    } else {
      setPinError("Incorrect PIN.");
    }
  }

  async function loadData() {
    setLoading(true);
    const [{ data: pData, error: pErr }, { data: vData, error: vErr }] = await Promise.all([
      supabase.from("participants").select("*").order("created_at", { ascending: false }),
      supabase.from("volunteers").select("*").order("created_at", { ascending: false }),
    ]);
    if (pErr) console.error(pErr);
    if (vErr) console.error(vErr);
    setParticipants((pData as Participant[]) || []);
    setVolunteers((vData as Volunteer[]) || []);
    setLoading(false);
  }

  async function togglePayment(record: Participant) {
    const newStatus = record.payment_status === "Paid" ? "Pending" : "Paid";
    const { error } = await supabase
      .from("participants")
      .update({ payment_status: newStatus })
      .eq("id", record.id);
    if (error) {
      console.error(error);
      alert("Could not update payment status. Try again.");
      return;
    }
    await loadData();
  }

  async function deleteRecord(type: "participant" | "volunteer", id: string) {
    if (!confirm("Remove this registration? This cannot be undone.")) return;
    const table = type === "participant" ? "participants" : "volunteers";
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      console.error(error);
      alert("Could not remove this record. Try again.");
      return;
    }
    await loadData();
  }

  function exportCsv() {
    const isChildView = activeTable === "child";
    let rows: (string | number)[][];
    let headers: string[];
    let filename: string;

    if (isChildView) {
      headers = [
        "Child Name", "Age", "Age Group", "Gender", "Class", "Parent Name", "Phone",
        "Emergency Name", "Emergency Phone", "Allergies", "New to Church", "Fee",
        "Payment Method", "Payment Ref", "Payment Status", "Registered At",
      ];
      rows = participants.map((p) => [
        p.child_name, p.age, p.age_group, p.gender, p.class_level, p.parent_name, p.phone,
        p.emergency_name, p.emergency_phone, p.allergies, p.newcomer ? "Yes" : "No", p.fee,
        p.payment_method, p.payment_ref, p.payment_status, p.created_at,
      ]);
      filename = "vbs-children.csv";
    } else {
      headers = ["Full Name", "Phone", "Email", "Areas of Interest", "Available Days", "Experience", "Registered At"];
      rows = volunteers.map((v) => [
        v.full_name, v.phone, v.email, (v.areas || []).join("; "), (v.days || []).join("; "),
        v.experience, v.created_at,
      ]);
      filename = "vbs-volunteers.csv";
    }

    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "");
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const paidCount = participants.filter((p) => p.payment_status === "Paid").length;
  const pendingCount = participants.length - paidCount;
  const collected = paidCount * CONFIG.fee;

  return (
    <section className="admin-section wrap" style={{ paddingTop: 48 }}>
      <div className="section-head">
        <div className="eyebrow">Staff only</div>
        <h2>Admin dashboard</h2>
        <p>Enter the admin PIN to view registrations, stats, and export data.</p>
      </div>

      {!unlocked ? (
        <div className="pin-box">
          <div className="field">
            <label>Admin PIN</label>
            <input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkPin()}
            />
          </div>
          <button className="btn btn-primary" onClick={checkPin}>
            Unlock
          </button>
          {pinError && (
            <div className="form-msg err" style={{ marginTop: 8 }}>
              {pinError}
            </div>
          )}
          <p className="helper-text" style={{ marginTop: 10 }}>
            Note: this PIN is a simple front-end gate for internal church use, not real security — the
            Supabase table also needs row-level security policies scoped appropriately (see README).
          </p>
        </div>
      ) : (
        <div>
          <div className="stat-row">
            <div className="stat-card">
              <div className="num">{participants.length}</div>
              <div className="lbl">Children Registered</div>
            </div>
            <div className="stat-card">
              <div className="num">{volunteers.length}</div>
              <div className="lbl">Volunteers Signed Up</div>
            </div>
            <div className="stat-card">
              <div className="num">GH₵{collected}</div>
              <div className="lbl">Fees Collected ({paidCount} Paid)</div>
            </div>
            <div className="stat-card">
              <div className="num">{pendingCount}</div>
              <div className="lbl">Payments Pending</div>
            </div>
          </div>

          <div className="admin-toolbar">
            <div className="admin-tabs">
              <button
                className={`admin-tab-btn ${activeTable === "child" ? "active" : ""}`}
                onClick={() => setActiveTable("child")}
              >
                Children
              </button>
              <button
                className={`admin-tab-btn ${activeTable === "volunteer" ? "active" : ""}`}
                onClick={() => setActiveTable("volunteer")}
              >
                Volunteers
              </button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-small" onClick={exportCsv}>
                Export CSV
              </button>
              <button className="btn-small" onClick={loadData}>
                Refresh
              </button>
            </div>
          </div>

          <div className="table-scroll">
            {activeTable === "child" ? (
              <table>
                <thead>
                  <tr>
                    <th>Child</th>
                    <th>Age</th>
                    <th>Group</th>
                    <th>Parent</th>
                    <th>Phone</th>
                    <th>Allergies</th>
                    <th>Payment</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan={8}>No child registrations yet.</td>
                    </tr>
                  ) : (
                    participants.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {p.child_name}
                          {p.newcomer && (
                            <span className="mono" style={{ fontSize: 10, color: "var(--coral)", marginLeft: 6 }}>
                              NEW
                            </span>
                          )}
                        </td>
                        <td>{p.age}</td>
                        <td>{p.age_group}</td>
                        <td>{p.parent_name}</td>
                        <td>{p.phone}</td>
                        <td>{p.allergies || "—"}</td>
                        <td>
                          <button
                            className={`pay-badge ${p.payment_status === "Paid" ? "paid" : "pending"}`}
                            onClick={() => togglePayment(p)}
                            title="Click to toggle"
                          >
                            {p.payment_status || "Pending"}
                          </button>
                          <div style={{ fontSize: 10, color: "var(--text-soft)", marginTop: 2 }}>
                            {p.payment_method || "—"}
                            {p.payment_ref ? ` · ${p.payment_ref}` : ""}
                          </div>
                        </td>
                        <td>
                          <button className="del-btn" onClick={() => deleteRecord("participant", p.id)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Areas</th>
                    <th>Days</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan={6}>No volunteer sign-ups yet.</td>
                    </tr>
                  ) : (
                    volunteers.map((v) => (
                      <tr key={v.id}>
                        <td>{v.full_name}</td>
                        <td>{v.phone}</td>
                        <td>{v.email || "—"}</td>
                        <td>{(v.areas || []).join(", ")}</td>
                        <td>{(v.days || []).join(", ")}</td>
                        <td>
                          <button className="del-btn" onClick={() => deleteRecord("volunteer", v.id)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          {loading && <p className="loading-txt">Loading registrations...</p>}
        </div>
      )}
    </section>
  );
}
