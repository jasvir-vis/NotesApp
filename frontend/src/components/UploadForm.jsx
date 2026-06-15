import { useState } from "react";
import API from "../services/api";

const UploadForm = ({ courseId, refreshTopics }) => {
  const [form, setForm] = useState({
    topicName: "",
    studentName: "",
    registrationNo: "",
  });
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("courseId", courseId);
    data.append("topicName", form.topicName);
    data.append("studentName", form.studentName);
    data.append("registrationNo", form.registrationNo);
    data.append("file", file);

    try {
      await API.post("/topics/upload", data);
      alert("Uploaded successfully ✅");

      setForm({
        topicName: "",
        studentName: "",
        registrationNo: "",
      });
      setFile(null);

      refreshTopics(); // reload topics
    } catch (err) {
      alert("Upload failed ❌");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mt-4">
      <h2 className="text-lg font-bold mb-2">Upload Topic</h2>

      <input
        type="text"
        placeholder="Topic Name"
        value={form.topicName}
        onChange={(e) => setForm({ ...form, topicName: e.target.value })}
        className="block mb-2 p-2 border w-full"
        required
      />

      <input
        type="text"
        placeholder="Student Name"
        value={form.studentName}
        onChange={(e) => setForm({ ...form, studentName: e.target.value })}
        className="block mb-2 p-2 border w-full"
        required
      />

      <input
        type="text"
        placeholder="Registration No"
        value={form.registrationNo}
        onChange={(e) =>
          setForm({ ...form, registrationNo: e.target.value })
        }
        className="block mb-2 p-2 border w-full"
        required
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
        required
      />

      <button className="bg-green-500 text-white px-4 py-2">
        Upload
      </button>
    </form>
  );
};

export default UploadForm;