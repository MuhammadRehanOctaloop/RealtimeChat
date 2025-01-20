// ...existing code...
async function sendImageMessage(imageFile) {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('content', ''); // Ensure content field is included

        const response = await axios.post('/api/messages/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error sending image:', error);
        throw error;
    }
}
// ...existing code...
