import { Request, Response, NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';
// import isHmacMatched from './hmac-verification';
import IAuthentication from './authentication';
import Administrator from '../admin/administrators/Administrator';
import PharmacyAdmin from '../pharmacy_admin/PharmacyAdmin';
import Pharmacy from '../pharmacies/Pharmacy';
import Installer from '../installers/Installers';
import RevokedToken from './RevokedTokensModel';

interface IDecodedJWT {
	sub: string;
	scope: 'admin' | 'app';
	authorities?: string;
	pharmacyId?: number;
	iat?: number;
	exp?: number;
}

interface IExcludedEndpoints {
	method: 'POST' | 'GET';
	path: string;
}

export const jwtFilter = async (
	request: Request & { authentication: IAuthentication },
	response: Response,
	next: NextFunction
) => {
	try {
		const excludedEndpoints: IExcludedEndpoints[] = [
			{ method: 'POST', path: '/v1/administrators/setup' },
			{ method: 'POST', path: '/v1/administrators/auth' },
			{ method: 'POST', path: '/v1/pharmacies' },
			{ method: 'POST', path: '/v1/patients' },
			{ method: 'POST', path: '/v1/patients/auth' },
			{ method: 'POST', path: '/v1/patients/auth-google' },
			{ method: 'POST', path: '/v1/patients/refresh-auth' },
			{ method: 'POST', path: '/v1/patients/auth-otp' },
			{ method: 'POST', path: '/v1/patients/start-password-recovery' },
			{ method: 'POST', path: '/v1/patients/complete-password-recovery' },
			{ method: 'POST', path: '/v1/pharmacy-administrators/auth' },
			{ method: 'POST', path: '/v1/pharmacy-administrators/refresh-auth' },
			{
				method: 'POST',
				path: '/v1/pharmacy-administrators/start-password-recovery',
			},
			{
				method: 'POST',
				path: '/v1/pharmacy-administrators/complete-password-recovery',
			},
			{ method: 'POST', path: '/v1/administrators/start-password-recovery' },
			{ method: 'POST', path: '/v1/administrators/complete-password-recovery' },
			{ method: 'GET', path: '/v1/patients/check' },
			{ method: 'POST', path: '/v1/verifications/confirm-registration' },
			{ method: 'POST', path: '/v1/sales' },
			{ method: 'GET', path: '/v1/app-inventory' },
			{ method: 'GET', path: '/v1/patients/auth-google/callback' },
			{ method: 'POST', path: '/v1/installers/login' },
			{ method: 'POST', path: '/v1/riders/refresh-auth' },
			{ method: 'POST', path: '/v1/riders/login' },
			{ method: 'POST', path: '/v1/riders/request-login-otp' },
			{ method: 'POST', path: '/v1/doctors/refresh-auth' },
			{ method: 'POST', path: '/v1/doctors/login' },
			{ method: 'POST', path: '/v1/doctors/request-login-otp' },
			// {method: 'POST', path: '/v1/appointments-availability-slots/create-slots'}
		];

		let skipRequest = false;
		excludedEndpoints.forEach((endpoint) => {
			if (
				req.baseUrl + req.path === endpoint.path &&
				req.method === endpoint.method
			) {
				skipRequest = true;
			}
		});

		if (skipRequest) {
			return next();
		}

		const authHeader = req.headers['authorization'];

		if (!authHeader) {
			return res.status(401).json({
				timestamp: new Date(),
				path: req.baseUrl + req.path,
				message: 'provide an authorization header',
			});
		}

		const [, token] = authHeader.split(' ');
		if (!token) {
			return res.status(401).json({
				timestamp: new Date(),
				path: req.baseUrl + req.path,
				message: 'cannot find authorization token',
			});
		}

		return jsonwebtoken.verify(
			token,
			process.env.JWT_KEY,
			async (err, decoded: IDecodedJWT) => {
				if (!decoded) {
					return res.status(401).json({
						timestamp: new Date(),
						path: req.baseUrl + req.path,
						message: 'Token Expired',
					});
				}
				const isRevoked = await RevokedToken.findOne({
					where: { subject: decoded?.sub },
				});

				if (isRevoked) {
					return res.status(403).json({
						timestamp: new Date(),
						path: req.baseUrl + req.path,
						message: 'Token revoked: access denied',
					});
				}

				if (decoded) {
					const scope = decoded?.scope;

					if (scope === 'admin') {
						await Administrator.findByPk(String(decoded?.sub));
					}

					if (scope === 'app') {
						const y = await PharmacyAdmin.findByPk(String(decoded?.sub), {
							include: [{ model: Pharmacy, as: 'pharmacy' }],
						});
						const i = await Installer.findByPk(String(decoded?.sub));
						if (y || i) {
							// If pharmacyId is in the token, use that pharmacy instead of the admin's default pharmacy
							let targetPharmacy = y ? y.pharmacy : null;

							if (decoded.pharmacyId) {
								const targetPharmacyRecord = await Pharmacy.findByPk(
									decoded.pharmacyId
								);
								if (targetPharmacyRecord) {
									targetPharmacy = targetPharmacyRecord;
								}
							}

							req.authentication = {
								...req.authentication,
								pharmacy: targetPharmacy,
							};
						}
					}

					// if (!isHmacMatched(req, token, authSecret)) {
					// 	return res.status(417).json({
					// 		timestamp: new Date(),
					// 		path: req.baseUrl + req.path,
					// 		message: 'signature check failed',
					// 	});
					// }

					if (decoded.authorities) {
						const permissions = decoded.authorities.split(',');
						req.authentication = { ...req.authentication, permissions };
					}

					req.authentication = {
						...req.authentication,
						id: decoded.sub,
						scope,
						// is2FAEnabled: user.is2FAEnabled,
						// twoFASecret: user.twoFASecret,
						// email: user.email,
						// roleId: user.roleId,
					};

					return next();
				}

				return res.status(401).json({
					timestamp: new Date(),
					path: req.baseUrl + req.path,
					message: 'authorization failed: ' + err.message,
				});
			}
		);
	} catch (err) {
		return res.status(500).json({
			timestamp: new Date(),
			path: req.baseUrl + req.path,
			message: 'authorization failed: ' + err.message,
		});
	}
};

export const createJwtToken = ({
	subject,
	scope,
	authorities,
	pharmacyId,
	role,
}: {
	subject: string | number;
	authorities: string;
	scope: 'app' | 'admin';
	pharmacyId?: string;
	role?:string
}) => {
	const payload: { scope: string; authorities: string; pharmacyId?: string; role?:string } = {
		scope,
		authorities,
	};
	if (pharmacyId) {
		payload.pharmacyId = pharmacyId;
	}
	if (role) {
		payload.role = role;
	}

	// calculate expiration until next midnight
	const now = new Date();
	const nextMidnight = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate() + 1,
		0,
		0,
		0
	);
	const expiresInSeconds = Math.floor(
		(nextMidnight.getTime() - now.getTime()) / 1000
	);

	return jsonwebtoken.sign(payload, process.env.JWT_KEY, {
		expiresIn: expiresInSeconds,
		subject: String(subject),
		issuer: 'zamda',
	});
};

export const createRefreshToken = (subject: string | number) => {
	const refreshSecret = process.env.REFRESH_TOKEN_KEY as string;
	const refreshTTL = process.env.REFRESH_TOKEN_TTL || '30d';

	if (!refreshSecret) {
		throw new Error(
			'REFRESH_TOKEN_KEY is not defined in environment variables'
		);
	}

	return jsonwebtoken.sign({}, refreshSecret, {
		expiresIn: refreshTTL as jsonwebtoken.SignOptions['expiresIn'],
		subject: String(subject),
		issuer: 'zamda',
	});
};
