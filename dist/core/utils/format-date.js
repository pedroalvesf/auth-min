"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
function formatDate(date, onlyDate = false) {
    if (onlyDate) {
        return date
            ? date
                .toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
                .replace(',', '/')
            : undefined;
    }
    else {
        return date
            ? date
                .toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
                .replace(',', ' às')
            : undefined;
    }
}
