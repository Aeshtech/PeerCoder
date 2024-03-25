export function filterUniqueUsers(
  data: Array<{ userId: string; stream: MediaStream }>
) {
  // Create a Set to store unique user IDs
  const seenUsers = new Set();
  // Initialize an empty array to store filtered data
  const filteredData = [];

  // Loop through the input data
  for (const item of data) {
    // Check if the user ID has already been seen
    if (!seenUsers.has(item.userId)) {
      // Add the user ID to the seenUsers set
      seenUsers.add(item.userId);
      // Add the object to the filtered data array
      filteredData.push(item);
    }
  }

  // Return the filtered data
  return filteredData;
}
