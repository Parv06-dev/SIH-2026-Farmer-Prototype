import { formatTime } from "../utils/format";

export default function NotificationPhone({ notification, flashKey }) {
  return (
    <aside className="phone-panel">
      <div className="phone" key={flashKey}>
        <div className="phone-notch" />
        <p className="phone-title">📱 FARMER NOTIFICATION</p>
        {notification ? (
          <div className="phone-body">
            <p className="phone-headline">{notification.headline || notification.title}</p>
            <p className="phone-to">To: {notification.farmerName}</p>
            <p className="phone-text">{notification.body}</p>
            {notification.beforeWindow && notification.afterWindow && (
              <p className="phone-shift">
                {notification.beforeWindow}
                <span> → </span>
                {notification.afterWindow}
              </p>
            )}
            <ul className="channel-list">
              {Object.values(notification.channels || {}).map((channel) => (
                <li key={channel.label}>
                  ✓ {channel.label} {channel.status === "SENT" ? "sent" : channel.status}
                </li>
              ))}
            </ul>
            <p className="phone-time">
              {notification.createdAt
                ? new Date(notification.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : formatTime("00:00")}
            </p>
          </div>
        ) : (
          <div className="phone-body muted">
            <p>Waiting for smart automation…</p>
            <p>Incident alerts will appear here as SMS, WhatsApp and IVR.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
