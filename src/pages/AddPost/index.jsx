import React from "react";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import SimpleMDE from "react-simplemde-editor";
import { useSelector } from "react-redux";
import "easymde/dist/easymde.min.css";
import styles from "./AddPost.module.scss";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { selectIsAuth } from "../../redux/slices/auth";
import axios from "../../axios";

export const AddPost = () => {
  const { id } = useParams();
  const isAuth = useSelector(selectIsAuth);
  const [text, setText] = React.useState("");
  const [isLoading, setLoading] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const inputFileRef = React.useRef(null);
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const handleChangeFile = async (event) => {
    try {
      const formData = new FormData();
      const file = event.target.files[0];
      console.log("Selected file:", file);
      formData.append("image", file);
      const token = window.localStorage.getItem("token");
      console.log("Token:", token);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      if (!response.data.url) {
        throw new Error("No URL in response");
      }
      setImageUrl(response.data.url);
    } catch (error) {
      console.error("Upload error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert("Ошибка загрузки файла");
    }
  };

  const onClickRemoveImage = () => {
    setImageUrl("");
  };

  const onChange = React.useCallback((value) => {
    setText(value);
  }, []);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const fields = {
        title,
        imageUrl,
        tags: tags ? tags.split(",").map((tag) => tag.trim()).filter((tag) => tag) : [], // Обрабатываем пустые теги
        text,
      };
      console.log("Sending post data:", fields);
      const response = isEditing
        ? await axios.patch(`/posts/${id}`, fields, {
            headers: {
              Authorization: `Bearer ${window.localStorage.getItem("token")}`,
            },
          })
        : await axios.post("/posts", fields, {
            headers: {
              Authorization: `Bearer ${window.localStorage.getItem("token")}`,
            },
          });
      console.log("Post response:", response.data);
      const postId = isEditing ? id : response.data._id;
      navigate(`/posts/${postId}`);
    } catch (error) {
      console.error("Post error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      alert(
        isEditing ? "Ошибка при редактировании статьи" : "Ошибка при создании статьи"
      );
    } finally {
      setLoading(false); // Сбрасываем загрузку
    }
  };
  React.useEffect(() => {
    if (id) {
      axios
        .get(`/posts/${id}`)
        .then(({ data }) => {
          setTitle(data.title);
          setText(data.text);
          setImageUrl(data.imageUrl);
          setTags(data.tags.join(","));
        })
        .catch((err) => {
          console.warn(err);
          alert("Ошибка при получении статьи");
        });
    }
  }, []);

  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: "400px",
      autofocus: true,
      placeholder: "Введите текст...",
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    []
  );

  if (!window.localStorage.getItem("token") && !isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <Paper style={{ padding: 30 }}>
      <Button
        onClick={() => inputFileRef.current.click()}
        variant="outlined"
        size="large"
      >
        Загрузить превью
      </Button>
      <input
        ref={inputFileRef}
        type="file"
        onChange={handleChangeFile}
        hidden
      />
      {imageUrl && (
        <>
          <Button
            variant="contained"
            color="error"
            onClick={onClickRemoveImage}
          >
            Удалить
          </Button>
          <img
            className={styles.image}
            src={`${process.env.REACT_APP_API_URL}${imageUrl}`}
            alt="Uploaded"
          />
        </>
      )}
      <br />
      <br />
      <TextField
        classes={{ root: styles.title }}
        variant="standard"
        placeholder="Заголовок статьи..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
      <TextField
        classes={{ root: styles.tags }}
        variant="standard"
        placeholder="Тэги"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        fullWidth
      />
      <SimpleMDE
        className={styles.editor}
        value={text}
        onChange={onChange}
        options={options}
      />
      <div className={styles.buttons}>
        <Button onClick={onSubmit} size="large" variant="contained">
          {isEditing ? "Сохранить" : "Опубликовать"}
        </Button>
        <a href="/">
          <Button size="large">Отмена</Button>
        </a>
      </div>
    </Paper>
  );
};
