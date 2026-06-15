import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const TopicMasterPage = () => {
  const { courseId } = useParams();

  const [topics, setTopics] = useState([]);
  const [file, setFile] = useState(null);
  const [topicInput, setTopicInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Load topics
  const loadTopics = async () => {
    try {
      const res = await API.get(`/topic-master/${courseId}`);
      setTopics(res.data);
    } catch (err) {
      // Error silently handled
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  // 🔥 Excel Upload
  const handleExcelUpload = async () => {
    if (!file) return alert("Select file first ❌");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);

    try {
      setLoading(true);
      await API.post("/topic-master/excel", formData);
      alert("Excel uploaded ✅");
      setFile(null);
      loadTopics();
    } catch (err) {
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Manual Add
  const handleManualAdd = async () => {
    if (!topicInput.trim()) return alert("Enter topic ❌");

    try {
      setLoading(true);
      await API.post("/topic-master/manual", {
        courseId,
        topic: topicInput
      });

      alert("Topic added ✅");
      setTopicInput("");
      loadTopics();
    } catch (err) {
      alert("Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Delete Topic
  const handleDeleteTopic = async (topicName) => {
    if (!window.confirm(`Are you sure you want to delete "${topicName}"?`)) return;

    try {
      setLoading(true);
      await API.delete("/topic-master/delete", {
        data: { courseId, topic: topicName }
      });
      alert("Topic deleted ✅");
      loadTopics();
    } catch (err) {
      alert("Failed to delete ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-2xl font-bold mb-6">
        Topic Management
      </h1>

      {/* Excel Upload */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-bold mb-2">Upload Excel</h2>

        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-2"
        />

        <button
          onClick={handleExcelUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Upload Excel
        </button>
      </div>

      {/* Manual Add */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-bold mb-2">Add Topic Manually</h2>

        <input
          type="text"
          placeholder="Enter topic or comma separated"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />

        <button
          onClick={handleManualAdd}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Add Topic
        </button>
      </div>

      {/* Topics List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-4">Topics List</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topics.length > 0 ? (
            topics.map((t, i) => (
              <div
                key={i}
                className="border p-3 rounded bg-gray-50 hover:bg-gray-100 transition-colors relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800 truncate pr-2">{t}</span>
                  <button
                    onClick={() => handleDeleteTopic(t)}
                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete topic"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No topics found</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default TopicMasterPage;