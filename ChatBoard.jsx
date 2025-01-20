// ...existing code...
async function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        try {
            await sendImageMessage(file);
            // ...existing code...
        } catch (error) {
            console.error('Error sending image:', error);
        }
    }
}
// ...existing code...
