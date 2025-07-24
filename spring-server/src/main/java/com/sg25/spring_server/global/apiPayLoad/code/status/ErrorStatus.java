package com.sg25.spring_server.global.apiPayLoad.code.status;

import com.sg25.spring_server.global.apiPayLoad.code.BaseErrorCode;
import com.sg25.spring_server.global.apiPayLoad.code.ErrorReasonDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorStatus implements BaseErrorCode {

    // 가장 일반적인 응답
    _INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON500", "서버 에러, 관리자에게 문의 바랍니다."),
    _BAD_REQUEST(HttpStatus.BAD_REQUEST,"COMMON400","잘못된 요청입니다."),
    _UNAUTHORIZED(HttpStatus.UNAUTHORIZED,"COMMON401","인증이 필요합니다."),
    _FORBIDDEN(HttpStatus.FORBIDDEN, "COMMON403", "금지된 요청입니다."),
    _NOT_FOUND(HttpStatus.NOT_FOUND, "COMMON404", "찾을 수 없는 요청입니다."),
    _DUPLICATE_RESOURCE(HttpStatus.BAD_REQUEST, "COMMON406", "중복된 요청입니다."),

    _PASSWORD_INVALID(HttpStatus.BAD_REQUEST, "AUTH401", "비밀번호가 올바르지 않습니다."),
    _REFRESH_TOKEN_INVALID(HttpStatus.BAD_REQUEST, "AUTH402", "리프레시 토큰이 올바르지 않습니다."),
    _EMAIL_INVALID(HttpStatus.BAD_REQUEST, "AUTH403", "이메일이 올바르지 않습니다."),
    _DUPLICATE_MEMBER(HttpStatus.BAD_REQUEST, "AUTH404", "이미 가입된 이메일입니다."),

    _NO_LOGIN(HttpStatus.BAD_REQUEST, "SESSION400", "로그인 정보가 없습니다."),

    _FILE_UPLOAD_FAIL(HttpStatus.INTERNAL_SERVER_ERROR, "FILE500", "파일 업로드에 실패했습니다.");


    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public ErrorReasonDTO getReason() {
        return ErrorReasonDTO.builder()
                .message(message)
                .code(code)
                .isSuccess(false)
                .build();
    }

    @Override
    public ErrorReasonDTO getReasonHttpStatus() {
        return ErrorReasonDTO.builder()
                .message(message)
                .code(code)
                .isSuccess(false)
                .httpStatus(httpStatus)
                .build()
                ;
    }
}
