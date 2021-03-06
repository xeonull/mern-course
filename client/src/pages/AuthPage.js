import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useHttp } from "../hooks/http.hook";
import { useMessage } from "../hooks/message.hook";

export const AuthPage = () => {
  // Валидация полей на клиенте
  const auth = useContext(AuthContext)
  const message = useMessage();
  const { loading, request, error, clearError } = useHttp();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    //console.log("Erro:", error);
    message(error);
    clearError();
  }, [error, message, clearError]);

  useEffect(() => {
    window.M.updateTextFields()
  }, []);

  const changeHandler = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const registerHandler = async () => {
    try {
      const data = await request("/api/auth/register", "POST", { ...form });
      //console.log("Data:", data);
      message(data.message);
    } catch (e) {}
  };

  const loginHandler = async () => {
    try {
      const data = await request("/api/auth/login", "POST", { ...form });
      auth.login(data.token, data.userId)
    } catch (e) {}
  };

  return (
    <div className="row">
      <div className="col s6 offset-s8"></div>
      <h1>Сократи ссылку</h1>
      <div className="card blue darken-1">
        <div className="card-content white-text">
          <span className="card-title ">Авторизация</span>
          <div>
            <div className="input-field">
              <input
                placeholder="Введите email"
                id="email"
                type="text"
                name="email"
                className="yellow-input"
                value={form.email}
                onChange={changeHandler}
              />
              <label htmlFor="email">Email</label>
            </div>
            <div className="input-field">
              <input
                placeholder="Введите пароль"
                id="password"
                type="password"
                name="password"
                value={form.password}
                className="yellow-input"
                onChange={changeHandler}
              />
              <label htmlFor="password">Пароль</label>
            </div>
          </div>
        </div>
        <div className="card-action">
          <button
            className="btn yellow darken-4"
            style={{ marginRight: 10 }}
            onClick={loginHandler}
            disabled={loading}
          >
            Войти
          </button>
          <button
            className="btn gray lighten-1 black-text"
            onClick={registerHandler}
            disabled={loading}
          >
            Регистрация
          </button>
        </div>
      </div>
    </div>
  );
};
