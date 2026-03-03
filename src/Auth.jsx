import { useState } from 'react'
import { supabase } from './supabase'
import styles from './Auth.module.css'

export default function Auth() {
    const [mode, setMode] = useState('login') // 'login' | 'register' | 'verify' | 'forgot'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showPass, setShowPass] = useState(false)

    const clearError = () => setError(null)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        clearError()
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
        setLoading(false)
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.')
            return
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.')
            return
        }
        setLoading(true)
        clearError()
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin,
            },
        })
        if (error) {
            setError(error.message)
        } else {
            setMode('verify')
        }
        setLoading(false)
    }

    const handleForgot = async (e) => {
        e.preventDefault()
        setLoading(true)
        clearError()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        })
        if (error) {
            setError(error.message)
        } else {
            setError(null)
            setMode('forgot-sent')
        }
        setLoading(false)
    }

    // ── Pantalla: Email enviado para verificación ──
    if (mode === 'verify') {
        return (
            <div className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.verifyIcon}>📬</div>
                    <h1 className={styles.verifyTitle}>Revisa tu email</h1>
                    <p className={styles.verifyText}>
                        Enviamos un enlace de verificación a<br />
                        <strong>{email}</strong>
                    </p>
                    <p className={styles.verifyHint}>
                        Haz clic en el enlace del correo para activar tu cuenta.
                        Puede tardar unos minutos.
                    </p>
                    <button className={styles.backBtn} onClick={() => setMode('login')}>
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        )
    }

    // ── Pantalla: Forgot password sent ──
    if (mode === 'forgot-sent') {
        return (
            <div className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.verifyIcon}>✉️</div>
                    <h1 className={styles.verifyTitle}>Email enviado</h1>
                    <p className={styles.verifyText}>
                        Si <strong>{email}</strong> tiene una cuenta,<br />
                        recibirás un enlace para restablecer tu contraseña.
                    </p>
                    <button className={styles.backBtn} onClick={() => setMode('login')}>
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        )
    }

    // ── Pantalla: Forgot password form ──
    if (mode === 'forgot') {
        return (
            <div className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>✦</span>
                        <span className={styles.logoText}>Nerdo's Tracker</span>
                    </div>
                    <h1 className={styles.heading}>Recuperar contraseña</h1>
                    <p className={styles.sub}>Te enviaremos un enlace a tu email.</p>
                    {error && <div className={styles.error}>{error}</div>}
                    <form onSubmit={handleForgot} className={styles.form}>
                        <div className={styles.field}>
                            <label className={styles.label}>Email</label>
                            <input
                                type="email"
                                className={styles.input}
                                placeholder="tu@email.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); clearError() }}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <button type="submit" className={styles.btn} disabled={loading}>
                            {loading ? <span className={styles.spinner} /> : 'Enviar enlace'}
                        </button>
                    </form>
                    <button className={styles.link} onClick={() => { setMode('login'); clearError() }}>
                        ← Volver al inicio de sesión
                    </button>
                </div>
            </div>
        )
    }

    // ── Login / Register ──
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {/* Logo */}
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>✦</span>
                    <span className={styles.logoText}>Nerdo's Tracker</span>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
                        onClick={() => { setMode('login'); clearError() }}
                    >
                        Iniciar sesión
                    </button>
                    <button
                        className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
                        onClick={() => { setMode('register'); clearError() }}
                    >
                        Registrarse
                    </button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className={styles.form}>
                    {/* Email */}
                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="tu@email.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); clearError() }}
                            required
                            autoComplete="email"
                        />
                    </div>

                    {/* Password */}
                    <div className={styles.field}>
                        <label className={styles.label}>Contraseña</label>
                        <div className={styles.passWrap}>
                            <input
                                type={showPass ? 'text' : 'password'}
                                className={styles.input}
                                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                                value={password}
                                onChange={e => { setPassword(e.target.value); clearError() }}
                                required
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            />
                            <button
                                type="button"
                                className={styles.eyeBtn}
                                onClick={() => setShowPass(v => !v)}
                                tabIndex={-1}
                                aria-label="Toggle password"
                            >
                                {showPass ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {/* Confirm password (solo en registro) */}
                    {mode === 'register' && (
                        <div className={styles.field}>
                            <label className={styles.label}>Confirmar contraseña</label>
                            <div className={styles.passWrap}>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className={styles.input}
                                    placeholder="Repite tu contraseña"
                                    value={confirmPassword}
                                    onChange={e => { setConfirmPassword(e.target.value); clearError() }}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    )}

                    {/* Forgot password */}
                    {mode === 'login' && (
                        <button
                            type="button"
                            className={styles.forgotBtn}
                            onClick={() => { setMode('forgot'); clearError() }}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    )}

                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading
                            ? <span className={styles.spinner} />
                            : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
                    </button>
                </form>

                {mode === 'register' && (
                    <p className={styles.terms}>
                        Al registrarte aceptas nuestros términos de uso. Se enviará un email de verificación.
                    </p>
                )}
            </div>
        </div>
    )
}
