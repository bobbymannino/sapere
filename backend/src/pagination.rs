use serde::{Deserialize, Serialize};
use validator::Validate;

const DEFAULT_PAGE: u32 = 1;
const DEFAULT_PAGE_SIZE: u32 = 20;

#[derive(Debug, Clone, Copy, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Pagination {
    #[serde(default = "default_page")]
    #[validate(range(min = 1))]
    pub page: u32,

    #[serde(default = "default_page_size")]
    #[validate(range(min = 1, max = 100))]
    pub page_size: u32,
}

const fn default_page() -> u32 {
    DEFAULT_PAGE
}

const fn default_page_size() -> u32 {
    DEFAULT_PAGE_SIZE
}

impl Default for Pagination {
    fn default() -> Self {
        Self {
            page: DEFAULT_PAGE,
            page_size: DEFAULT_PAGE_SIZE,
        }
    }
}

impl Pagination {
    pub fn limit(self) -> i64 {
        i64::from(self.page_size)
    }

    pub fn offset(self) -> i64 {
        let zero_indexed = self.page.saturating_sub(1);
        i64::from(zero_indexed).saturating_mul(i64::from(self.page_size))
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Paginated<T> {
    pub items: Vec<T>,
    pub page: u32,
    pub page_size: u32,
    pub total: i64,
    pub total_pages: u32,
}

impl<T> Paginated<T> {
    pub fn new(items: Vec<T>, pagination: Pagination, total: i64) -> Self {
        let total_pages = if total <= 0 {
            0
        } else {
            let denom = u64::from(pagination.page_size).max(1);
            let total_u = u64::try_from(total).unwrap_or(0);
            u32::try_from(total_u.div_ceil(denom)).unwrap_or(u32::MAX)
        };

        Self {
            items,
            page: pagination.page,
            page_size: pagination.page_size,
            total,
            total_pages,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn pagination(page: u32, page_size: u32) -> Pagination {
        Pagination { page, page_size }
    }

    #[test]
    fn limit_returns_page_size() {
        assert_eq!(pagination(1, 20).limit(), 20);
        assert_eq!(pagination(5, 100).limit(), 100);
    }

    #[test]
    fn offset_first_page_is_zero() {
        assert_eq!(pagination(1, 20).offset(), 0);
    }

    #[test]
    fn offset_page_zero_saturates_to_zero() {
        assert_eq!(pagination(0, 20).offset(), 0);
    }

    #[test]
    fn offset_subsequent_pages() {
        assert_eq!(pagination(2, 20).offset(), 20);
        assert_eq!(pagination(3, 50).offset(), 100);
    }

    #[test]
    fn offset_does_not_overflow_on_extreme_values() {
        let p = pagination(u32::MAX, u32::MAX);
        assert_eq!(p.offset(), i64::MAX);
    }

    #[test]
    fn paginated_empty_has_zero_total_pages() {
        let p: Paginated<i32> = Paginated::new(vec![], pagination(1, 20), 0);
        assert_eq!(p.total, 0);
        assert_eq!(p.total_pages, 0);
    }

    #[test]
    fn paginated_negative_total_has_zero_total_pages() {
        let p: Paginated<i32> = Paginated::new(vec![], pagination(1, 20), -5);
        assert_eq!(p.total_pages, 0);
    }

    #[test]
    fn paginated_exact_division() {
        let p: Paginated<i32> = Paginated::new(vec![], pagination(1, 10), 20);
        assert_eq!(p.total_pages, 2);
    }

    #[test]
    fn paginated_partial_last_page_rounds_up() {
        let p: Paginated<i32> = Paginated::new(vec![], pagination(1, 10), 21);
        assert_eq!(p.total_pages, 3);
    }

    #[test]
    fn paginated_single_item_is_one_page() {
        let p: Paginated<i32> = Paginated::new(vec![1], pagination(1, 20), 1);
        assert_eq!(p.total_pages, 1);
    }

    #[test]
    fn paginated_preserves_page_metadata() {
        let p: Paginated<i32> = Paginated::new(vec![1, 2, 3], pagination(2, 50), 75);
        assert_eq!(p.page, 2);
        assert_eq!(p.page_size, 50);
        assert_eq!(p.total, 75);
        assert_eq!(p.total_pages, 2);
    }
}
