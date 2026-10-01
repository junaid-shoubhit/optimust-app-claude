export const getInitials = (name = "") => {
  const parts = name?.trim()?.split(/\s+/)?.filter(Boolean);

  if (!parts?.length) return "?";

  if (parts?.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getAddress = (contact) =>
  [
    contact?.address,
    [contact?.city, contact?.stateName].filter(Boolean).join(", "),
    [contact?.country, contact?.zip].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
