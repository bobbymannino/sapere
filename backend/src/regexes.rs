use std::sync::LazyLock;

use regex::Regex;

#[allow(clippy::expect_used, reason = "regex literal is verified at first access")]
pub static PATTERN_USERNAME: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[a-zA-Z0-9_]{3,32}$").expect("PATTERN_USERNAME regex should be valid"));

#[allow(clippy::expect_used, reason = "regex literal is verified at first access")]
pub static PATTERN_PASSWORD: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^[a-zA-Z0-9_!@#$%^&*()_+=-]{8,50}$").expect("PATTERN_PASSWORD regex should be valid")
});
