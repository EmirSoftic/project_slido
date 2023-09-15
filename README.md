Slido - Interactive Presentation and Audience Engagement Platform.

Slido is a dynamic web application designed to facilitate audience interaction during lectures, conferences, and similar events. Developed using modern web technologies, Slido offers multiple modules and caters to different types of users:

System Administrator
Presenter
Audience
System Administrator Module:

The System Administrator has comprehensive control over the system, including:

User Management: Perform CRUD (Create, Read, Update, Delete) operations on all users, especially presenters.

Manage Scheduled Events: View and manage all scheduled events, including the ability to delete future events.

User Blocking: Temporarily block users for 15 or 30 days.

Lookup Tables: Manage lookup tables used within the system.

Presenter Module:

Presenters, who are registered users, have significant capabilities within the system:

Event Creation:

Easily create events by specifying a code, title, time, and repetition rules (e.g., weekly until June 15th). Upload a cover image for the event.

Access Code Sharing: Share access codes for events with guests.

Event Dashboard: View a list of all created events with statistics on the number of questions asked and answered.

Question Management: Review all questions asked during an event. Presenters can delete, answer, or hide questions. Questions can be sorted by various criteria (e.g., time, approval count).

Mail Reports: Receive email reports after each event, containing a list of questions, approval counts, and overall statistics.

Hidden Questions: View and selectively answer hidden questions, which contain prohibited words.

Guest Invitation: Share event access links with guests via email.

Audience Module:
The Audience module is designed for guests who access the system without registration.

Event Participation: Guests enter an event using a shared code from the presenter.

Question Submission: Guests can ask questions, approve other questions, and engage in the interactive experience.

Event Access via Link: Guests can access events via direct links provided by presenters.

Filter and Sort: Guests can sort questions for easier interaction.

Real-Time Updates: The question and interaction page for both guests and presenters automatically refreshes when new data is available (e.g., new questions or likes).

Technology Stack:

Back-End: Developed using Node.js, the server handles data processing and communication with the database.

Front-End: Utilizes HTML5, CSS, and JavaScript for creating a user-friendly and responsive interface.

Database: Stores user and event data, ensuring data persistence and retrieval.

SQL Database: Provides structured data storage for efficient management.
