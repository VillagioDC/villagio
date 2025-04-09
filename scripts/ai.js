// AI functions

function submitTopic(newQuery) {
    const input = document.getElementById('topic');
    const query = newQuery || input.value.trim();
    
    if (!query) {
        alert('Please enter a search query');
        return;
    }

    console.log('Query:', query);

    fetch('/aigossip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        const resultContainer = document.getElementById('result');
        const followUp = document.getElementById('follow-up');

        const result = data.result || 'No response received';
        
        // Parse response into answer and next question
        const [_, returned] = result.split('Answer: ');
        const [answer, nextTopic] = returned.split('\nNextTopic: ');
        resultContainer.textContent = answer || result;
        followUp.textContent = nextTopic || '';

        // Auto-continue with next question
        if (nextTopic) {
            setTimeout(() => {
                submitTopic(nextTopic.trim());
            }, 5000); // 1s delay between responses
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Display an error message in the result container
        document.getElementById('result').textContent = 'An error occurred. Please try again.';
    });
}