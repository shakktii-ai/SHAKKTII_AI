// api/response.js

export const getApiResponse = async (resultText) => {
    const url = "http://139.59.42.156:11434/api/generate";
    const headers = {
      "Content-Type": "application/json"
    };
    const data = {
      model: "gemma:2b",
      prompt: resultText,
      stream: false
    };
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const responseData = await response.json();
        return responseData.response; // Return the response from the API
      } else {
        console.error("Error fetching response from the API.");
        return null;
      }
    } catch (error) {
      console.error("Error in the fetch operation:", error);
      return null;
    }
  };
  