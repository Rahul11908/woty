import { db } from "./server/db";
import { users } from "./shared/schema";
import { ne } from "drizzle-orm";

async function exportAttendees() {
  try {
    const attendees = await db
      .select()
      .from(users)
      .where(ne(users.id, 1))
      .orderBy(users.fullName);
    
    console.log("\n=== ATTENDEES EXPORT ===");
    console.log(`Total attendees: ${attendees.length}\n`);
    
    // CSV Header
    console.log("ID,Full Name,Email,Job Title,Company,LinkedIn URL,Bio,Avatar URL");
    
    // CSV Rows
    attendees.forEach((attendee) => {
      const row = [
        attendee.id,
        `"${attendee.fullName || ''}"`,
        `"${attendee.email || ''}"`,
        `"${attendee.jobTitle || ''}"`,
        `"${attendee.company || ''}"`,
        `"${attendee.linkedInUrl || ''}"`,
        `"${(attendee.bio || '').replace(/"/g, '""')}"`,
        `"${attendee.avatar || ''}"`
      ].join(',');
      console.log(row);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

exportAttendees();
